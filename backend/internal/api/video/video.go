package video

import (
	"fmt"
	"net/http"
	"os"
	"path/filepath"
	"strings"
	"time"

	"medapp/internal/api/middleware"
	"medapp/internal/db"
	"medapp/internal/models"

	"github.com/gin-gonic/gin"
)

const UploadDir = "./uploads"

type videoResponse struct {
	ID          uint      `json:"id"`
	Title       string    `json:"title"`
	Description string    `json:"description"`
	FileURL     string    `json:"fileUrl"`
	Thumbnail   string    `json:"thumbnail"`
	Public      bool      `json:"public"`
	CreatedAt   time.Time `json:"createdAt"`
	Uploader    *struct {
		ID       uint   `json:"id"`
		FullName string `json:"fullName"`
		Role     string `json:"role"`
	} `json:"uploader,omitempty"`
}

func RegisterRoutes(r *gin.RouterGroup) {
	r.GET("", listVideos)
	r.GET("/", listVideos)
	r.GET("/:id", getVideo)
	authGroup := r.Group("")
	authGroup.Use(middleware.AuthRequired(), middleware.RequireRole(models.RoleDoctor))
	authGroup.POST("", uploadVideo)
	authGroup.POST("/", uploadVideo)
}

func listVideos(c *gin.Context) {
	var videos []models.Video
	if err := db.DB.Preload("Uploader").Order("created_at DESC").Find(&videos).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to load videos"})
		return
	}

	responses := make([]videoResponse, 0, len(videos))
	for _, v := range videos {
		responses = append(responses, toVideoResponse(&v))
	}

	c.JSON(http.StatusOK, responses)
}

func getVideo(c *gin.Context) {
	var video models.Video
	if err := db.DB.Preload("Uploader").First(&video, c.Param("id")).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "video not found"})
		return
	}

	c.JSON(http.StatusOK, toVideoResponse(&video))
}

func uploadVideo(c *gin.Context) {
	user := middleware.CurrentUser(c)
	if user == nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "unauthenticated"})
		return
	}

	if err := os.MkdirAll(UploadDir, os.ModePerm); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to create upload directory"})
		return
	}

	file, err := c.FormFile("file")
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "video file is required"})
		return
	}

	title := c.PostForm("title")
	if strings.TrimSpace(title) == "" {
		title = strings.TrimSuffix(file.Filename, filepath.Ext(file.Filename))
	}
	description := c.PostForm("description")

	filename := fmt.Sprintf("%d_%s", time.Now().UnixNano(), sanitizeFilename(file.Filename))
	destination := filepath.Join(UploadDir, filename)

	if err := c.SaveUploadedFile(file, destination); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to save video"})
		return
	}

	relativePath := "/uploads/" + filename
	video := models.Video{
		Title:       title,
		Description: description,
		FilePath:    relativePath,
		UploaderID:  user.ID,
		Public:      true,
	}

	if err := db.DB.Create(&video).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to store video metadata"})
		return
	}

	c.JSON(http.StatusCreated, toVideoResponse(&video))
}

func toVideoResponse(video *models.Video) videoResponse {
	resp := videoResponse{
		ID:          video.ID,
		Title:       video.Title,
		Description: video.Description,
		FileURL:     video.FilePath,
		Thumbnail:   video.Thumbnail,
		Public:      video.Public,
		CreatedAt:   video.CreatedAt,
	}
	if video.Uploader != nil {
		resp.Uploader = &struct {
			ID       uint   `json:"id"`
			FullName string `json:"fullName"`
			Role     string `json:"role"`
		}{
			ID:       video.Uploader.ID,
			FullName: video.Uploader.FullName,
			Role:     string(video.Uploader.Role),
		}
	}
	return resp
}

func sanitizeFilename(name string) string {
	return strings.Map(func(r rune) rune {
		if (r >= 'a' && r <= 'z') || (r >= 'A' && r <= 'Z') || (r >= '0' && r <= '9') {
			return r
		}
		switch r {
		case '.', '-', '_':
			return r
		default:
			return '_'
		}
	}, filepath.Base(name))
}
