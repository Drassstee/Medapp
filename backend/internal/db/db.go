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
	); err != nil {
		log.Fatal("AutoMigrate failed: ", err)
	}

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
