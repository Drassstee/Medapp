package video

import (
	"net/http"
	"os"
	"path/filepath"

	"github.com/gin-gonic/gin"
)

const UploadDir = "./uploads"

type Video struct {
	Name string `json:"name"`
	URL  string `json:"url"`
}

func List() []Video {
	files, err := os.ReadDir(UploadDir)
	if err != nil {
		return []Video{}
	}
	var videos []Video
	for _, f := range files {
		if !f.IsDir() {
			videos = append(videos, Video{
				Name: f.Name(),
				URL:  "/uploads/" + f.Name(),
			})
		}
	}
	return videos
}

func GetVideos(c *gin.Context) {
	videos := List()
	c.JSON(http.StatusOK, videos)
}

func UploadVideo(c *gin.Context) {
	file, err := c.FormFile("file")
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "no file uploaded"})
		return
	}
	if err := os.MkdirAll(UploadDir, os.ModePerm); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to create upload directory"})
		return
	}

	dst := filepath.Join(UploadDir, file.Filename)
	if err := c.SaveUploadedFile(file, dst); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to save video"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "uploaded successfully",
		"url":     "/uploads/" + file.Filename,
	})
}
