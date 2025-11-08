package models

import "time"

type Role string

const (
	RoleDoctor  Role = "doctor"
	RolePatient Role = "patient"
	RoleAdmin   Role = "admin"
)

type AppointmentStatus string

const (
	AppointmentPending   AppointmentStatus = "pending"
	AppointmentConfirmed AppointmentStatus = "confirmed"
	AppointmentCompleted AppointmentStatus = "completed"
	AppointmentCancelled AppointmentStatus = "cancelled"
)

type User struct {
	ID           uint      `gorm:"primaryKey" json:"id"`
	CreatedAt    time.Time `json:"createdAt"`
	UpdatedAt    time.Time `json:"updatedAt"`
	Email        string    `gorm:"uniqueIndex;size:255;not null" json:"email"`
	PasswordHash string    `gorm:"size:255;not null" json:"-"`
	FullName     string    `gorm:"size:255;not null" json:"fullName"`
	Phone        string    `gorm:"size:100" json:"phone"`
	Role         Role      `gorm:"type:varchar(20);not null" json:"role"`
	Status       string    `gorm:"size:50;default:'active'" json:"status"`

	DoctorProfile         *DoctorProfile  `json:"doctorProfile,omitempty"`
	PatientProfile        *PatientProfile `json:"patientProfile,omitempty"`
	Videos                []Video              `json:"videos,omitempty" gorm:"foreignKey:UploaderID"`
	AppointmentsAsDoctor  []Appointment        `gorm:"foreignKey:DoctorID" json:"-"`
	AppointmentsAsPatient []Appointment        `gorm:"foreignKey:PatientID" json:"-"`
	DoctorPatients        []DoctorPatient      `gorm:"foreignKey:DoctorID" json:"-"`
	PatientDoctors         []DoctorPatient      `gorm:"foreignKey:PatientID" json:"-"`
	MedicalInfo            *PatientMedicalInfo   `gorm:"foreignKey:PatientID" json:"medicalInfo,omitempty"`
	MedicalInfoCreated    []PatientMedicalInfo  `gorm:"foreignKey:DoctorID" json:"-"`
}

type DoctorProfile struct {
	ID              uint      `gorm:"primaryKey" json:"id"`
	CreatedAt       time.Time `json:"createdAt"`
	UpdatedAt       time.Time `json:"updatedAt"`
	UserID          uint      `gorm:"uniqueIndex" json:"userId"`
	Speciality      string    `gorm:"size:255" json:"speciality"`
	Experience      int       `json:"experienceYears"`
	LicenseNumber   string    `gorm:"size:255" json:"licenseNumber"`
	ClinicName      string    `gorm:"size:255" json:"clinicName"`
	City            string    `gorm:"size:255" json:"city"`
	Bio             string    `gorm:"type:text" json:"bio"`
	AvatarURL       string    `gorm:"size:512" json:"avatarUrl"`
	ConsultationFee int       `json:"consultationFee"`
	User            *User     `gorm:"constraint:OnDelete:CASCADE" json:"-"`
}

type PatientProfile struct {
	ID                uint       `gorm:"primaryKey" json:"id"`
	CreatedAt         time.Time  `json:"createdAt"`
	UpdatedAt         time.Time  `json:"updatedAt"`
	UserID            uint       `gorm:"uniqueIndex" json:"userId"`
	DateOfBirth       *time.Time `json:"dateOfBirth"`
	Gender            string     `gorm:"size:50" json:"gender"`
	BloodType         string     `gorm:"size:10" json:"bloodType"`
	Allergies         string     `gorm:"type:text" json:"allergies"`
	ChronicConditions string     `gorm:"type:text" json:"chronicConditions"`
	EmergencyContact  string     `gorm:"size:255" json:"emergencyContact"`
	User              *User      `gorm:"constraint:OnDelete:CASCADE" json:"-"`
}

type Video struct {
	ID          uint      `gorm:"primaryKey" json:"id"`
	CreatedAt   time.Time `json:"createdAt"`
	UpdatedAt   time.Time `json:"updatedAt"`
	Title       string    `gorm:"size:255;not null" json:"title"`
	Description string    `gorm:"type:text" json:"description"`
	FilePath    string    `gorm:"size:512;not null" json:"filePath"`
	Thumbnail   string    `gorm:"size:512" json:"thumbnail"`
	UploaderID  uint      `json:"uploaderId"`
	Uploader    *User     `json:"uploader,omitempty" gorm:"constraint:OnUpdate:CASCADE,OnDelete:SET NULL"`
	Public      bool      `gorm:"default:true" json:"public"`
}

type Appointment struct {
	ID          uint              `gorm:"primaryKey" json:"id"`
	CreatedAt   time.Time         `json:"createdAt"`
	UpdatedAt   time.Time         `json:"updatedAt"`
	DoctorID    uint              `json:"doctorId"`
	PatientID   uint              `json:"patientId"`
	ScheduledAt time.Time         `json:"scheduledAt"`
	DurationMin int               `json:"durationMin"`
	Status      AppointmentStatus `gorm:"type:varchar(20);default:'pending'" json:"status"`
	Reason      string            `gorm:"type:text" json:"reason"`
	Notes       string            `gorm:"type:text" json:"notes"`
	Doctor      *User             `json:"doctor,omitempty"`
	Patient     *User             `json:"patient,omitempty"`
}

// DoctorPatient represents the many-to-many relationship between doctors and patients
type DoctorPatient struct {
	ID        uint      `gorm:"primaryKey" json:"id"`
	CreatedAt time.Time `json:"createdAt"`
	DoctorID  uint      `gorm:"index" json:"doctorId"`
	PatientID uint      `gorm:"index" json:"patientId"`
	Doctor    *User     `json:"doctor,omitempty" gorm:"constraint:OnDelete:CASCADE"`
	Patient   *User     `json:"patient,omitempty" gorm:"constraint:OnDelete:CASCADE"`
}

// PatientMedicalInfo stores medical information filled by doctors
type PatientMedicalInfo struct {
	ID          uint      `gorm:"primaryKey" json:"id"`
	CreatedAt   time.Time `json:"createdAt"`
	UpdatedAt   time.Time `json:"updatedAt"`
	PatientID   uint      `gorm:"uniqueIndex" json:"patientId"`
	DoctorID    uint      `gorm:"index" json:"doctorId"` // Doctor who filled this info
	Gender      string    `gorm:"size:50" json:"gender"`
	AgeGroup    string    `gorm:"size:50" json:"ageGroup"` // e.g., "0-18", "19-35", "36-50", "51-65", "65+"
	DiseaseIDs  string    `gorm:"type:text" json:"-"`      // JSON array of disease IDs
	Diseases    []Disease `gorm:"many2many:patient_medical_info_diseases;" json:"diseases"`
	Patient     *User     `json:"patient,omitempty" gorm:"constraint:OnDelete:CASCADE"`
	Doctor      *User     `json:"doctor,omitempty" gorm:"constraint:OnDelete:SET NULL"`
}

// Disease represents a chronic or other disease
type Disease struct {
	ID          uint      `gorm:"primaryKey" json:"id"`
	CreatedAt   time.Time `json:"createdAt"`
	Name        string    `gorm:"size:255;uniqueIndex;not null" json:"name"`
	Category    string    `gorm:"size:100" json:"category"` // e.g., "Chronic", "Infectious", "Genetic"
	Description string    `gorm:"type:text" json:"description"`
}
