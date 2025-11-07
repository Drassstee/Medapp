package ml

import (
	"net/http"

	"medapp/internal/api/middleware"
	"medapp/internal/mlclient"

	"github.com/gin-gonic/gin"
)

type symptomsRequest struct {
	Fever    bool `json:"fever"`
	Cough    bool `json:"cough"`
	Headache bool `json:"headache"`
}

var client = mlclient.New()

func RegisterRoutes(r *gin.RouterGroup) {
	r.Use(middleware.AuthRequired())
	r.POST("/symptoms", predictSymptoms)
}

func predictSymptoms(c *gin.Context) {
	var req symptomsRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	resp, err := client.PredictSymptoms(mlclient.SymptomsPayload{
		Fever:    req.Fever,
		Cough:    req.Cough,
		Headache: req.Headache,
	})
	if err != nil {
		c.JSON(http.StatusBadGateway, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, resp)
}
