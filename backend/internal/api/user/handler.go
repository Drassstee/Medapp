package user

import (
	"net/http"

	"medapp/internal/api/middleware"
	"medapp/internal/db"
	"medapp/internal/models"

	"github.com/gin-gonic/gin"
)

func RegisterRoutes(r *gin.RouterGroup) {
	r.GET("/doctors", listDoctors)
	r.GET("/patients", middleware.AuthRequired(), listPatients)
}

func listDoctors(c *gin.Context) {
	var doctors []models.User
	if err := db.DB.
		Preload("DoctorProfile").
		Where("role = ?", models.RoleDoctor).
		Order("full_name ASC").
		Find(&doctors).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to load doctors"})
		return
	}

	results := make([]gin.H, 0, len(doctors))
	for _, d := range doctors {
		profile := gin.H{}
		if d.DoctorProfile != nil {
			profile = gin.H{
				"speciality":      d.DoctorProfile.Speciality,
				"experienceYears": d.DoctorProfile.Experience,
				"licenseNumber":   d.DoctorProfile.LicenseNumber,
				"clinicName":      d.DoctorProfile.ClinicName,
				"city":            d.DoctorProfile.City,
				"bio":             d.DoctorProfile.Bio,
				"avatarUrl":       d.DoctorProfile.AvatarURL,
				"consultationFee": d.DoctorProfile.ConsultationFee,
			}
		}
		results = append(results, gin.H{
			"id":            d.ID,
			"fullName":      d.FullName,
			"email":         d.Email,
			"phone":         d.Phone,
			"doctorProfile": profile,
		})
	}

	c.JSON(http.StatusOK, results)
}

func listPatients(c *gin.Context) {
	user := middleware.CurrentUser(c)
	if user == nil || (user.Role != models.RoleDoctor && user.Role != models.RoleAdmin) {
		c.JSON(http.StatusForbidden, gin.H{"error": "forbidden"})
		return
	}

	var patients []models.User
	if err := db.DB.
		Preload("PatientProfile").
		Where("role = ?", models.RolePatient).
		Order("full_name ASC").
		Find(&patients).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to load patients"})
		return
	}

	results := make([]gin.H, 0, len(patients))
	for _, p := range patients {
		profile := gin.H{}
		if p.PatientProfile != nil {
			profile = gin.H{
				"gender":            p.PatientProfile.Gender,
				"bloodType":         p.PatientProfile.BloodType,
				"allergies":         p.PatientProfile.Allergies,
				"chronicConditions": p.PatientProfile.ChronicConditions,
			}
		}
		results = append(results, gin.H{
			"id":             p.ID,
			"fullName":       p.FullName,
			"email":          p.Email,
			"phone":          p.Phone,
			"patientProfile": profile,
		})
	}

	c.JSON(http.StatusOK, results)
}
