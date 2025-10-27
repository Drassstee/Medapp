package main

import (
	"log"
	"medapp/internal/api"
	"medapp/internal/db"
	"os"

	"github.com/gin-gonic/gin"
)

func main() {
	r := gin.Default()
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
