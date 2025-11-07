package api

import (
	"net/http"

	"medapp/internal/api/appointment"
	"medapp/internal/api/auth"
	"medapp/internal/api/home"
	"medapp/internal/api/ml"
	"medapp/internal/api/user"
	"medapp/internal/api/video"

	"github.com/gin-gonic/gin"
)

func RegisterRoutes(r *gin.Engine) {
	r.GET("/", home.GetHomeContent)
	api := r.Group("/api")
	{
		auth.RegisterRoutes(api.Group("/auth"))
		video.RegisterRoutes(api.Group("/videos"))
		appointment.RegisterRoutes(api.Group("/appointments"))
		ml.RegisterRoutes(api.Group("/ml"))
		user.RegisterRoutes(api.Group("/users"))
		api.GET("/status", func(c *gin.Context) {
			c.JSON(http.StatusOK, gin.H{"message": "MedApp Backend Running"})
		})
	}
	r.Static("/uploads", "./uploads")
}
