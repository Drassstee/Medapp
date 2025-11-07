package home

import (
	"net/http"

	"medapp/internal/db"
	"medapp/internal/models"

	"github.com/gin-gonic/gin"
)

func GetHomeContent(c *gin.Context) {
	var videos []models.Video
	if err := db.DB.Preload("Uploader").Order("created_at DESC").Limit(8).Find(&videos).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to load homepage"})
		return
	}

	items := make([]gin.H, 0, len(videos))
	for _, v := range videos {
		item := gin.H{
			"id":          v.ID,
			"title":       v.Title,
			"description": v.Description,
			"fileUrl":     v.FilePath,
			"thumbnail":   v.Thumbnail,
			"createdAt":   v.CreatedAt,
		}
		if v.Uploader != nil {
			item["uploader"] = gin.H{
				"id":       v.Uploader.ID,
				"fullName": v.Uploader.FullName,
				"role":     v.Uploader.Role,
			}
		}
		items = append(items, item)
	}

	c.JSON(http.StatusOK, gin.H{
		"videos": items,
	})
}
