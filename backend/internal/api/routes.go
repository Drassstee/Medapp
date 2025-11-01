package api

import (
	"medapp/internal/api/home"
	"medapp/internal/api/video"
	"net/http"

	"github.com/gin-gonic/gin"
)

func RegisterRoutes(r *gin.Engine) {
	r.GET("/", home.GetHomeContent)
	api := r.Group("/api")
	{
		api.GET("/videos", video.GetVideos)
		api.POST("/videos", video.UploadVideo)
		api.GET("/status", func(c *gin.Context) {
			c.JSON(http.StatusOK, gin.H{"message": "MedApp Backend Running"})
		})
	}
	r.Static("/uploads", "./uploads")
}
