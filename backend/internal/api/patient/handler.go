package patient

import (
	"net/http"
	"strconv"

	"medapp/internal/api/middleware"
	"medapp/internal/db"
	"medapp/internal/models"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

func RegisterRoutes(r *gin.RouterGroup) {
	r.Use(middleware.AuthRequired(), middleware.RequireRole(models.RoleDoctor))
	r.POST("/assign", assignPatient)
	r.POST("/:id/medical-info", updateMedicalInfo)
	r.GET("/", listPatients)
	r.GET("/diseases", listDiseases)
}

// Assign patient to doctor
type assignPatientRequest struct {
	PatientID uint `json:"patientId" binding:"required"`
}

func assignPatient(c *gin.Context) {
	doctor := middleware.CurrentUser(c)
	if doctor == nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "unauthenticated"})
		return
	}

	var req assignPatientRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Check if patient exists
	var patient models.User
	if err := db.DB.Where("id = ? AND role = ?", req.PatientID, models.RolePatient).First(&patient).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			c.JSON(http.StatusNotFound, gin.H{"error": "patient not found"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to check patient"})
		return
	}

	// Check if already assigned
	var existing models.DoctorPatient
	if err := db.DB.Where("doctor_id = ? AND patient_id = ?", doctor.ID, req.PatientID).First(&existing).Error; err != nil {
		if err != gorm.ErrRecordNotFound {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to check existing assignment"})
			return
		}
		// Not found, so we can proceed
	} else {
		// Found existing assignment
		c.JSON(http.StatusBadRequest, gin.H{"error": "patient already assigned to this doctor"})
		return
	}

	// Create assignment
	assignment := models.DoctorPatient{
		DoctorID:  doctor.ID,
		PatientID: req.PatientID,
	}

	if err := db.DB.Create(&assignment).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to assign patient"})
		return
	}

	if err := db.DB.Preload("Patient").Preload("Doctor").First(&assignment, assignment.ID).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to load assignment"})
		return
	}

	c.JSON(http.StatusCreated, gin.H{
		"id":        assignment.ID,
		"doctorId":  assignment.DoctorID,
		"patientId": assignment.PatientID,
		"patient": gin.H{
			"id":       assignment.Patient.ID,
			"fullName": assignment.Patient.FullName,
			"email":    assignment.Patient.Email,
		},
		"createdAt": assignment.CreatedAt,
	})
}

// Update patient medical info
type updateMedicalInfoRequest struct {
	Gender    string  `json:"gender" binding:"required"`
	AgeGroup  string  `json:"ageGroup" binding:"required"`
	DiseaseIDs []uint `json:"diseaseIds"`
}

func updateMedicalInfo(c *gin.Context) {
	doctor := middleware.CurrentUser(c)
	if doctor == nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "unauthenticated"})
		return
	}

	patientID, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid patient id"})
		return
	}

	var req updateMedicalInfoRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Check if patient exists
	var patient models.User
	if err := db.DB.Where("id = ? AND role = ?", patientID, models.RolePatient).First(&patient).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			c.JSON(http.StatusNotFound, gin.H{"error": "patient not found"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to check patient"})
		return
	}

	// Load diseases
	var diseases []models.Disease
	if len(req.DiseaseIDs) > 0 {
		if err := db.DB.Where("id IN ?", req.DiseaseIDs).Find(&diseases).Error; err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "invalid disease ids"})
			return
		}
	}

	// Create or update medical info
	var medicalInfo models.PatientMedicalInfo
	if err := db.DB.Where("patient_id = ?", patientID).First(&medicalInfo).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			// Create new
			medicalInfo = models.PatientMedicalInfo{
				PatientID: uint(patientID),
				DoctorID:  doctor.ID,
				Gender:    req.Gender,
				AgeGroup:  req.AgeGroup,
			}
			if err := db.DB.Create(&medicalInfo).Error; err != nil {
				c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to create medical info"})
				return
			}
		} else {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to check medical info"})
			return
		}
	} else {
		// Update existing
		medicalInfo.DoctorID = doctor.ID
		medicalInfo.Gender = req.Gender
		medicalInfo.AgeGroup = req.AgeGroup
		if err := db.DB.Model(&medicalInfo).Updates(map[string]interface{}{
			"doctor_id": doctor.ID,
			"gender":    req.Gender,
			"age_group": req.AgeGroup,
		}).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to update medical info"})
			return
		}
	}

	// Update diseases association
	if err := db.DB.Model(&medicalInfo).Association("Diseases").Replace(diseases); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to update diseases"})
		return
	}

	// Reload with associations
	if err := db.DB.Preload("Diseases").Preload("Patient").Preload("Doctor").First(&medicalInfo, medicalInfo.ID).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to load medical info"})
		return
	}

	c.JSON(http.StatusOK, toMedicalInfoResponse(&medicalInfo))
}

// List patients with filter
func listPatients(c *gin.Context) {
	doctor := middleware.CurrentUser(c)
	if doctor == nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "unauthenticated"})
		return
	}

	filter := c.Query("filter") // "all" or "my" (default to "my")

	var patientIDs []uint
	if filter == "all" {
		// Get all patients
		if err := db.DB.Model(&models.User{}).Where("role = ?", models.RolePatient).Pluck("id", &patientIDs).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to load patients"})
			return
		}
	} else {
		// Get only doctor's patients
		if err := db.DB.Model(&models.DoctorPatient{}).Where("doctor_id = ?", doctor.ID).Pluck("patient_id", &patientIDs).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to load assignments"})
			return
		}
	}

	if len(patientIDs) == 0 {
		c.JSON(http.StatusOK, []gin.H{})
		return
	}

	var patients []models.User
	if err := db.DB.
		Preload("PatientProfile").
		Preload("MedicalInfo").
		Preload("MedicalInfo.Diseases").
		Preload("MedicalInfo.Doctor").
		Where("id IN ?", patientIDs).
		Order("full_name ASC").
		Find(&patients).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to load patients"})
		return
	}

	results := make([]gin.H, 0, len(patients))
	for _, p := range patients {
		patientData := gin.H{
			"id":       p.ID,
			"fullName": p.FullName,
			"email":    p.Email,
			"phone":    p.Phone,
		}

		if p.MedicalInfo != nil {
			diseases := make([]gin.H, 0, len(p.MedicalInfo.Diseases))
			for _, d := range p.MedicalInfo.Diseases {
				diseases = append(diseases, gin.H{
					"id":       d.ID,
					"name":     d.Name,
					"category": d.Category,
				})
			}
			patientData["medicalInfo"] = gin.H{
				"id":        p.MedicalInfo.ID,
				"gender":    p.MedicalInfo.Gender,
				"ageGroup":  p.MedicalInfo.AgeGroup,
				"diseases":  diseases,
				"updatedAt": p.MedicalInfo.UpdatedAt,
				"doctor": gin.H{
					"id":       p.MedicalInfo.Doctor.ID,
					"fullName": p.MedicalInfo.Doctor.FullName,
				},
			}
		}

		results = append(results, patientData)
	}

	c.JSON(http.StatusOK, results)
}

// List all diseases
func listDiseases(c *gin.Context) {
	var diseases []models.Disease
	if err := db.DB.Order("category ASC, name ASC").Find(&diseases).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to load diseases"})
		return
	}

	results := make([]gin.H, 0, len(diseases))
	for _, d := range diseases {
		results = append(results, gin.H{
			"id":          d.ID,
			"name":        d.Name,
			"category":    d.Category,
			"description": d.Description,
		})
	}

	c.JSON(http.StatusOK, results)
}

func toMedicalInfoResponse(info *models.PatientMedicalInfo) gin.H {
	diseases := make([]gin.H, 0, len(info.Diseases))
	for _, d := range info.Diseases {
		diseases = append(diseases, gin.H{
			"id":       d.ID,
			"name":     d.Name,
			"category": d.Category,
		})
	}

	response := gin.H{
		"id":        info.ID,
		"patientId": info.PatientID,
		"doctorId":  info.DoctorID,
		"gender":    info.Gender,
		"ageGroup":  info.AgeGroup,
		"diseases":  diseases,
		"createdAt": info.CreatedAt,
		"updatedAt": info.UpdatedAt,
	}

	if info.Patient != nil {
		response["patient"] = gin.H{
			"id":       info.Patient.ID,
			"fullName": info.Patient.FullName,
		}
	}

	if info.Doctor != nil {
		response["doctor"] = gin.H{
			"id":       info.Doctor.ID,
			"fullName": info.Doctor.FullName,
		}
	}

	return response
}

