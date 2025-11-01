package home

import (
	"medapp/internal/api/video"
	"net/http"

	"github.com/gin-gonic/gin"
)

func GetHomeContent(c *gin.Context) {
	videos := video.List()
	//newsItems := news.List()
	//doctors := doctor.ListFeatured()

	c.JSON(http.StatusOK, gin.H{
		"videos": videos,
		//"news":    newsItems,
		//"doctors": doctors,
	})
}
