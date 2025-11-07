package appointment

import (
	"errors"
	"net/http"
	"strconv"
	"strings"
	"time"

	"medapp/internal/api/middleware"
	"medapp/internal/db"
	"medapp/internal/models"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

var errPermissionDenied = errors.New("permission denied")

type createAppointmentRequest struct {
	DoctorID    uint   `json:"doctorId" binding:"required"`
	ScheduledAt string `json:"scheduledAt" binding:"required"`
	DurationMin int    `json:"durationMin"`
	Reason      string `json:"reason"`
}

type updateAppointmentRequest struct {
	ScheduledAt *string `json:"scheduledAt"`
	DurationMin *int    `json:"durationMin"`
	Reason      *string `json:"reason"`
	Notes       *string `json:"notes"`
}

type statusChangeRequest struct {
	Status string  `json:"status" binding:"required"`
	Notes  *string `json:"notes"`
}

func RegisterRoutes(r *gin.RouterGroup) {
	r.Use(middleware.AuthRequired())
	r.GET("", listAppointments)
	r.GET("/", listAppointments)
	r.POST("", middleware.RequireRole(models.RolePatient), createAppointment)
	r.POST("/", middleware.RequireRole(models.RolePatient), createAppointment)
	r.PUT("/:id", updateAppointment)
	r.PUT("/:id/status", updateStatus)
}

func listAppointments(c *gin.Context) {
	user := middleware.CurrentUser(c)
	if user == nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "unauthenticated"})
		return
	}

	status := c.Query("status")
	query := db.DB.Preload("Doctor").Preload("Patient").Order("scheduled_at DESC")

	switch user.Role {
	case models.RoleDoctor:
		query = query.Where("doctor_id = ?", user.ID)
	case models.RolePatient:
		query = query.Where("patient_id = ?", user.ID)
	default:
		// admins see everything
	}

	if status != "" {
		query = query.Where("status = ?", status)
	}

	var appointments []models.Appointment
	if err := query.Find(&appointments).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to load appointments"})
		return
	}

	responses := make([]gin.H, 0, len(appointments))
	for _, appt := range appointments {
		responses = append(responses, toAppointmentResponse(&appt))
	}

	c.JSON(http.StatusOK, responses)
}

func createAppointment(c *gin.Context) {
	user := middleware.CurrentUser(c)
	if user == nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "unauthenticated"})
		return
	}

	var req createAppointmentRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	scheduledAt, err := parseTime(req.ScheduledAt)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid scheduledAt"})
		return
	}

	appointment := models.Appointment{
		DoctorID:    req.DoctorID,
		PatientID:   user.ID,
		ScheduledAt: scheduledAt,
		DurationMin: req.DurationMin,
		Reason:      req.Reason,
		Status:      models.AppointmentPending,
	}

	if err := db.DB.Create(&appointment).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to create appointment"})
		return
	}

	if err := preloadAppointment(&appointment); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to load appointment"})
		return
	}

	c.JSON(http.StatusCreated, toAppointmentResponse(&appointment))
}

func updateAppointment(c *gin.Context) {
	user := middleware.CurrentUser(c)
	if user == nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "unauthenticated"})
		return
	}

	appointment, err := getAppointmentForUser(c.Param("id"), user)
	if err != nil {
		handleAppointmentError(c, err)
		return
	}

	var req updateAppointmentRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	updates := map[string]interface{}{}
	if req.ScheduledAt != nil {
		if parsed, err := parseTime(*req.ScheduledAt); err == nil {
			updates["scheduled_at"] = parsed
		} else {
			c.JSON(http.StatusBadRequest, gin.H{"error": "invalid scheduledAt"})
			return
		}
	}
	if req.DurationMin != nil {
		updates["duration_min"] = *req.DurationMin
	}
	if req.Reason != nil {
		updates["reason"] = *req.Reason
	}
	if req.Notes != nil && user.Role == models.RoleDoctor {
		updates["notes"] = *req.Notes
	}

	if len(updates) == 0 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "no updates provided"})
		return
	}

	if err := db.DB.Model(&appointment).Updates(updates).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to update appointment"})
		return
	}

	if err := preloadAppointment(appointment); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to load appointment"})
		return
	}

	c.JSON(http.StatusOK, toAppointmentResponse(appointment))
}

func updateStatus(c *gin.Context) {
	user := middleware.CurrentUser(c)
	if user == nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "unauthenticated"})
		return
	}

	appointment, err := getAppointmentForUser(c.Param("id"), user)
	if err != nil {
		handleAppointmentError(c, err)
		return
	}

	var req statusChangeRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	status := models.AppointmentStatus(strings.ToLower(req.Status))

	allowed := false
	switch user.Role {
	case models.RoleDoctor:
		if appointment.DoctorID != user.ID {
			c.JSON(http.StatusForbidden, gin.H{"error": "not allowed"})
			return
		}
		allowed = status == models.AppointmentConfirmed || status == models.AppointmentCompleted || status == models.AppointmentCancelled
	case models.RolePatient:
		if appointment.PatientID != user.ID {
			c.JSON(http.StatusForbidden, gin.H{"error": "not allowed"})
			return
		}
		allowed = status == models.AppointmentCancelled
	case models.RoleAdmin:
		allowed = true
	}

	if !allowed {
		c.JSON(http.StatusBadRequest, gin.H{"error": "status change not permitted"})
		return
	}

	updates := map[string]interface{}{
		"status": status,
	}
	if req.Notes != nil {
		updates["notes"] = *req.Notes
	}

	if err := db.DB.Model(appointment).Updates(updates).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to update status"})
		return
	}

	if err := preloadAppointment(appointment); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to load appointment"})
		return
	}

	c.JSON(http.StatusOK, toAppointmentResponse(appointment))
}

func parseTime(value string) (time.Time, error) {
	return time.Parse(time.RFC3339, value)
}

func getAppointmentForUser(idParam string, user *models.User) (*models.Appointment, error) {
	id, err := strconv.Atoi(idParam)
	if err != nil {
		return nil, gorm.ErrRecordNotFound
	}

	var appointment models.Appointment
	if err := db.DB.First(&appointment, id).Error; err != nil {
		return nil, err
	}

	switch user.Role {
	case models.RoleDoctor:
		if appointment.DoctorID != user.ID {
			return nil, errPermissionDenied
		}
	case models.RolePatient:
		if appointment.PatientID != user.ID {
			return nil, errPermissionDenied
		}
	}

	return &appointment, nil
}

func preloadAppointment(appointment *models.Appointment) error {
	return db.DB.Preload("Doctor").Preload("Patient").First(appointment, appointment.ID).Error
}

func handleAppointmentError(c *gin.Context, err error) {
	if errors.Is(err, errPermissionDenied) {
		c.JSON(http.StatusForbidden, gin.H{"error": "not allowed"})
		return
	}
	if errors.Is(err, gorm.ErrRecordNotFound) {
		c.JSON(http.StatusNotFound, gin.H{"error": "appointment not found"})
		return
	}
	c.JSON(http.StatusInternalServerError, gin.H{"error": "unexpected error"})
}

func toAppointmentResponse(appt *models.Appointment) gin.H {
	response := gin.H{
		"id":          appt.ID,
		"doctorId":    appt.DoctorID,
		"patientId":   appt.PatientID,
		"scheduledAt": appt.ScheduledAt,
		"durationMin": appt.DurationMin,
		"status":      appt.Status,
		"reason":      appt.Reason,
		"notes":       appt.Notes,
		"createdAt":   appt.CreatedAt,
		"updatedAt":   appt.UpdatedAt,
	}

	if appt.Doctor != nil {
		response["doctor"] = gin.H{
			"id":       appt.Doctor.ID,
			"fullName": appt.Doctor.FullName,
			"role":     appt.Doctor.Role,
		}
	}
	if appt.Patient != nil {
		response["patient"] = gin.H{
			"id":       appt.Patient.ID,
			"fullName": appt.Patient.FullName,
		}
	}
	return response
}
