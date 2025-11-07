package mlclient

import (
	"bytes"
	"encoding/json"
	"fmt"
	"net/http"
	"os"
	"time"
)

type Client struct {
	baseURL string
	http    *http.Client
}

type SymptomsPayload struct {
	Fever    bool `json:"fever"`
	Cough    bool `json:"cough"`
	Headache bool `json:"headache"`
}

type PredictionResponse struct {
	Prediction string  `json:"prediction"`
	Confidence float64 `json:"confidence"`
}

func New() *Client {
	return &Client{
		baseURL: getEnv("ML_SERVICE_URL", "http://localhost:8000"),
		http:    &http.Client{Timeout: 10 * time.Second},
	}
}

func (c *Client) PredictSymptoms(payload SymptomsPayload) (*PredictionResponse, error) {
	url := fmt.Sprintf("%s/predict/", c.baseURL)
	body, err := json.Marshal(payload)
	if err != nil {
		return nil, err
	}

	req, err := http.NewRequest(http.MethodPost, url, bytes.NewBuffer(body))
	if err != nil {
		return nil, err
	}
	req.Header.Set("Content-Type", "application/json")

	resp, err := c.http.Do(req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	if resp.StatusCode >= 300 {
		return nil, fmt.Errorf("ml service returned status %d", resp.StatusCode)
	}

	var prediction PredictionResponse
	if err := json.NewDecoder(resp.Body).Decode(&prediction); err != nil {
		return nil, err
	}

	return &prediction, nil
}

func getEnv(key, fallback string) string {
	if val := os.Getenv(key); val != "" {
		return val
	}
	return fallback
}
