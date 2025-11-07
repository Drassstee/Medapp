package auth

import (
	"net/http"
	"strings"
	"time"

	"medapp/internal/api/middleware"
	appAuth "medapp/internal/auth"
	"medapp/internal/models"

	"github.com/gin-gonic/gin"
)

type RegisterRequest struct {
	FullName string `json:"fullName" binding:"required"`
	Email    string `json:"email" binding:"required,email"`
	Password string `json:"password" binding:"required,min=6"`
	Phone    string `json:"phone"`
	Role     string `json:"role" binding:"required"`

	DoctorProfile  *DoctorProfileInput  `json:"doctorProfile"`
	PatientProfile *PatientProfileInput `json:"patientProfile"`
}

type DoctorProfileInput struct {
	Speciality      string `json:"speciality" binding:"required_without=PatientProfile"`
	ExperienceYears int    `json:"experienceYears"`
	LicenseNumber   string `json:"licenseNumber"`
	ClinicName      string `json:"clinicName"`
	City            string `json:"city"`
	Bio             string `json:"bio"`
	AvatarURL       string `json:"avatarUrl"`
	ConsultationFee int    `json:"consultationFee"`
}

type PatientProfileInput struct {
	DateOfBirth       *time.Time `json:"dateOfBirth"`
	Gender            string     `json:"gender"`
	BloodType         string     `json:"bloodType"`
	Allergies         string     `json:"allergies"`
	ChronicConditions string     `json:"chronicConditions"`
	EmergencyContact  string     `json:"emergencyContact"`
}

type LoginRequest struct {
	Email    string `json:"email" binding:"required,email"`
	Password string `json:"password" binding:"required"`
}

var service = appAuth.NewService()

func RegisterRoutes(r *gin.RouterGroup) {
	r.POST("/register", registerHandler)
	r.POST("/login", loginHandler)
	r.GET("/me", middleware.AuthRequired(), meHandler)
}

func registerHandler(c *gin.Context) {
	var req RegisterRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	role := strings.ToLower(req.Role)
	var modelRole models.Role
	switch role {
	case string(models.RoleDoctor):
		modelRole = models.RoleDoctor
	case string(models.RolePatient):
		modelRole = models.RolePatient
	default:
		c.JSON(http.StatusBadRequest, gin.H{"error": "role must be doctor or patient"})
		return
	}

	user := &models.User{
		FullName: req.FullName,
		Email:    strings.ToLower(req.Email),
		Phone:    req.Phone,
		Role:     modelRole,
	}

	var doctorProfile *models.DoctorProfile
	var patientProfile *models.PatientProfile

	if modelRole == models.RoleDoctor {
		if req.DoctorProfile == nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "doctor profile is required for doctor accounts"})
			return
		}
		doctorProfile = &models.DoctorProfile{
			Speciality:      req.DoctorProfile.Speciality,
			Experience:      req.DoctorProfile.ExperienceYears,
			LicenseNumber:   req.DoctorProfile.LicenseNumber,
			ClinicName:      req.DoctorProfile.ClinicName,
			City:            req.DoctorProfile.City,
			Bio:             req.DoctorProfile.Bio,
			AvatarURL:       req.DoctorProfile.AvatarURL,
			ConsultationFee: req.DoctorProfile.ConsultationFee,
		}
	}

	if modelRole == models.RolePatient {
		patientProfile = &models.PatientProfile{}
		if req.PatientProfile != nil {
			patientProfile.DateOfBirth = req.PatientProfile.DateOfBirth
			patientProfile.Gender = req.PatientProfile.Gender
			patientProfile.BloodType = req.PatientProfile.BloodType
			patientProfile.Allergies = req.PatientProfile.Allergies
			patientProfile.ChronicConditions = req.PatientProfile.ChronicConditions
			patientProfile.EmergencyContact = req.PatientProfile.EmergencyContact
		}
	}

	res, err := service.Register(&appAuth.RegisterPayload{
		User:           user,
		Password:       req.Password,
		DoctorProfile:  doctorProfile,
		PatientProfile: patientProfile,
	})
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	sanitizeUser(res.User)
	c.JSON(http.StatusCreated, res)
}

func loginHandler(c *gin.Context) {
	var req LoginRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	res, err := service.Authenticate(strings.ToLower(req.Email), req.Password)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": err.Error()})
		return
	}
	sanitizeUser(res.User)
	c.JSON(http.StatusOK, res)
}

func meHandler(c *gin.Context) {
	user := middleware.CurrentUser(c)
	if user == nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "unauthenticated"})
		return
	}
	sanitizeUser(user)
	c.JSON(http.StatusOK, gin.H{"user": user})
}

func sanitizeUser(user *models.User) {
	if user == nil {
		return
	}
	user.PasswordHash = ""
	if user.Videos != nil {
		for i := range user.Videos {
			user.Videos[i].Uploader = nil
		}
	}
}
