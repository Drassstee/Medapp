package main

import (
	"log"
	"medapp/internal/api"
	"medapp/internal/db"
	"os"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
)

func main() {
	r := gin.Default()

	// CORS configuration - allow all origins in development
	corsConfig := cors.Config{
		AllowOrigins:     []string{"http://localhost:3000", "http://localhost:5173", "http://localhost:8081", "http://127.0.0.1:3000", "http://127.0.0.1:5173"},
		AllowMethods:     []string{"GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Accept", "Authorization", "X-Requested-With"},
		ExposeHeaders:    []string{"Content-Length", "Content-Type"},
		AllowCredentials: true,
		MaxAge:           12 * 60 * 60, // 12 hours
	}

	// In development, allow all origins
	if os.Getenv("ENV") != "production" {
		corsConfig.AllowOriginFunc = func(origin string) bool {
			return true
		}
	}

	r.Use(cors.New(corsConfig))
	db.ConnectDB()
	api.RegisterRoutes(r)
	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}
	log.Println("Back starting on ", port)
	if err := r.Run(":" + port); err != nil {
		log.Fatal(err)
	}
}
