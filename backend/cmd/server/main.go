package main

import (
	"medapp/api"
	"medapp/internal/db"

	"github.com/gin-gonic/gin"
)

func main() {
	r := gin.Default()
	db.ConnectDB()
	api.RegisterRoutes(r)
	r.Run(":8080")
}
