package db

import (
	"fmt"
	"log"
	"os"
	"time"

	"medapp/internal/models"

	"gorm.io/driver/postgres"
	"gorm.io/gorm"
	"gorm.io/gorm/logger"
)

var DB *gorm.DB

func ConnectDB() {
	dsn := fmt.Sprintf(
		"host=%s user=%s password=%s dbname=%s port=%s sslmode=disable",
		getEnv("DB_HOST", "localhost"),
		getEnv("DB_USER", "Alib"),
		getEnv("DB_PASSWORD", "1507"),
		getEnv("DB_NAME", "medapp"),
		getEnv("DB_PORT", "5432"),
	)

	config := &gorm.Config{
		Logger: logger.Default.LogMode(logger.Warn),
	}

	db, err := gorm.Open(postgres.Open(dsn), config)
	if err != nil {
		log.Fatal("Failed to connect to DB: ", err)
	}

	sqlDB, err := db.DB()
	if err != nil {
		log.Fatal("Failed to get generic database instance: ", err)
	}
	sqlDB.SetMaxIdleConns(10)
	sqlDB.SetMaxOpenConns(25)
	sqlDB.SetConnMaxLifetime(5 * time.Minute)

	if err := db.AutoMigrate(
		&models.User{},
		&models.DoctorProfile{},
		&models.PatientProfile{},
		&models.Video{},
		&models.Appointment{},
		&models.DoctorPatient{},
		&models.PatientMedicalInfo{},
		&models.Disease{},
	); err != nil {
		log.Fatal("AutoMigrate failed: ", err)
	}

	// Seed common diseases if they don't exist
	seedDiseases(db)

	DB = db
	log.Println("PostgreSQL connected and models migrated")
}

func getEnv(key, fallback string) string {
	val := os.Getenv(key)
	if val == "" {
		return fallback
	}
	return val
}

func seedDiseases(db *gorm.DB) {
	diseases := []models.Disease{
		{Name: "Diabetes Type 1", Category: "Chronic", Description: "Autoimmune condition where the pancreas produces little or no insulin"},
		{Name: "Diabetes Type 2", Category: "Chronic", Description: "Metabolic disorder characterized by high blood sugar"},
		{Name: "Hypertension", Category: "Chronic", Description: "High blood pressure, a long-term medical condition"},
		{Name: "Asthma", Category: "Chronic", Description: "Chronic inflammatory disease of the airways"},
		{Name: "COPD", Category: "Chronic", Description: "Chronic Obstructive Pulmonary Disease"},
		{Name: "Heart Disease", Category: "Chronic", Description: "Various conditions affecting the heart"},
		{Name: "Arthritis", Category: "Chronic", Description: "Inflammation of one or more joints"},
		{Name: "Osteoporosis", Category: "Chronic", Description: "Bone disease that occurs when bone mineral density decreases"},
		{Name: "Chronic Kidney Disease", Category: "Chronic", Description: "Progressive loss of kidney function over time"},
		{Name: "Depression", Category: "Mental Health", Description: "Mood disorder causing persistent sadness"},
		{Name: "Anxiety Disorder", Category: "Mental Health", Description: "Mental health disorder characterized by excessive worry"},
		{Name: "Epilepsy", Category: "Neurological", Description: "Central nervous system disorder causing seizures"},
		{Name: "Migraine", Category: "Neurological", Description: "Recurrent headaches often accompanied by nausea"},
		{Name: "Thyroid Disease", Category: "Endocrine", Description: "Disorders affecting the thyroid gland"},
		{Name: "Obesity", Category: "Metabolic", Description: "Excessive body fat accumulation"},
		{Name: "Anemia", Category: "Hematological", Description: "Condition with reduced red blood cells or hemoglobin"},
		{Name: "Hepatitis", Category: "Infectious", Description: "Inflammation of the liver"},
		{Name: "HIV/AIDS", Category: "Infectious", Description: "Viral infection affecting the immune system"},
		{Name: "Tuberculosis", Category: "Infectious", Description: "Bacterial infection primarily affecting the lungs"},
		{Name: "Cancer", Category: "Oncological", Description: "Group of diseases involving abnormal cell growth"},
	}

	for _, disease := range diseases {
		var existing models.Disease
		if err := db.Where("name = ?", disease.Name).First(&existing).Error; err != nil {
			if err == gorm.ErrRecordNotFound {
				if err := db.Create(&disease).Error; err != nil {
					log.Printf("Failed to seed disease %s: %v", disease.Name, err)
				}
			}
		}
	}
}
