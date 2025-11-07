package auth

import (
	"errors"
	"fmt"
	"log"
	"os"
	"time"

	"medapp/internal/db"
	"medapp/internal/models"

	"gorm.io/gorm"
)

type Service struct{}

func NewService() *Service {
	return &Service{}
}

type AuthResult struct {
	User       *models.User `json:"user"`
	Token      string       `json:"token"`
	ExpiresIn  int64        `json:"expiresIn"`
	TokenType  string       `json:"tokenType"`
	RefreshTTL int64        `json:"refreshTtl,omitempty"`
}

type RegisterPayload struct {
	User           *models.User
	Password       string
	DoctorProfile  *models.DoctorProfile
	PatientProfile *models.PatientProfile
}

func (s *Service) Register(payload *RegisterPayload) (*AuthResult, error) {
	if payload == nil || payload.User == nil {
		return nil, errors.New("invalid payload")
	}
	if payload.Password == "" {
		return nil, errors.New("password is required")
	}

	user := payload.User

	var existing models.User
	if err := db.DB.Where("email = ?", user.Email).First(&existing).Error; err == nil {
		return nil, errors.New("email already registered")
	} else if !errors.Is(err, gorm.ErrRecordNotFound) {
		return nil, fmt.Errorf("check email: %w", err)
	}

	hashed, err := HashPassword(payload.Password)
	if err != nil {
		return nil, fmt.Errorf("hash password: %w", err)
	}
	user.PasswordHash = hashed
	log.Println("here")
	err = db.DB.Transaction(func(tx *gorm.DB) error {
		if err := tx.Create(user).Error; err != nil {
			return err
		}

		if payload.DoctorProfile != nil {
			payload.DoctorProfile.UserID = user.ID
			if err := tx.Create(payload.DoctorProfile).Error; err != nil {
				return err
			}
		}

		if payload.PatientProfile != nil {
			payload.PatientProfile.UserID = user.ID
			if err := tx.Create(payload.PatientProfile).Error; err != nil {
				return err
			}
		}

		return nil
	})
	log.Println("here2")
	if err != nil {
		return nil, fmt.Errorf("create user: %w", err)
	}
	log.Println("here3")
	return s.newAuthResult(user)
}

func (s *Service) Authenticate(email, password string) (*AuthResult, error) {
	var user models.User
	if err := db.DB.Preload("DoctorProfile").Preload("PatientProfile").Where("email = ?", email).First(&user).Error; err != nil {
		return nil, errors.New("invalid email or password")
	}

	if !CheckPasswordHash(user.PasswordHash, password) {
		return nil, errors.New("invalid email or password")
	}

	return s.newAuthResult(&user)
}

func (s *Service) newAuthResult(user *models.User) (*AuthResult, error) {
	log.Println("here5")
	expires := tokenExpiry()
	token, err := GenerateToken(user.ID, string(user.Role), expires)
	if err != nil {
		return nil, err
	}
	log.Println("here4")
	return &AuthResult{
		User:      user,
		Token:     token,
		ExpiresIn: int64(expires.Seconds()),
		TokenType: "Bearer",
	}, nil
}

func tokenExpiry() time.Duration {
	if val := os.Getenv("JWT_EXPIRES_IN"); val != "" {
		if d, err := time.ParseDuration(val); err == nil {
			return d
		}
	}
	return 24 * time.Hour
}
