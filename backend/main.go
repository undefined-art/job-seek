package main

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"log"
	"net/http"
	"os"
	"path/filepath"
	"regexp"
	"strings"
	"time"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"github.com/ledongthuc/pdf"
)

type CVAnalysisResponse struct {
	Score          int      `json:"score"`
	Suggestions    []string `json:"suggestions"`
	CoverLetter    string   `json:"coverLetter"`
	ProcessingTime string   `json:"processingTime"`
}

type OllamaRequest struct {
	Model  string `json:"model"`
	Prompt string `json:"prompt"`
	Stream bool   `json:"stream"`
}

type OllamaResponse struct {
	Response string `json:"response"`
	Done     bool   `json:"done"`
	Error    string `json:"error,omitempty"`
}

const (
	OLLAMA_URL    = "http://localhost:11434"
	MODEL_NAME    = "llama3.2:3b"
	MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB
)

func main() {
	r := gin.Default()

	config := cors.DefaultConfig()
	config.AllowOrigins = []string{"http://localhost:3000"}
	config.AllowMethods = []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"}
	config.AllowHeaders = []string{"Origin", "Content-Type", "Accept", "Authorization"}
	r.Use(cors.New(config))

	r.GET("/health", func(c *gin.Context) {
		ollamaHealthy := checkOllamaHealth()
		status := "healthy"

		if !ollamaHealthy {
			status = "unhealthy - Ollama not available"
		}

		c.JSON(http.StatusOK, gin.H{
			"status":           status,
			"timestamp":        time.Now(),
			"ollama_available": ollamaHealthy,
			"model":            MODEL_NAME,
		})
	})

	r.POST("/api/analyze", analyzeCV)

	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	log.Printf("Server starting on port %s", port)
	log.Fatal(r.Run(":" + port))
}

func analyzeCV(c *gin.Context) {
	startTime := time.Now()
	textInput := c.PostForm("text")

	var extractedText string
	file, header, err := c.Request.FormFile("file")

	if err == nil {
		defer file.Close()

		if header.Size > MAX_FILE_SIZE {
			c.JSON(http.StatusBadRequest, gin.H{"error": "File too large. Maximum size is 10MB."})
			return
		}

		extractedText, err = extractTextFromFile(file, header.Filename)

		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": fmt.Sprintf("Error processing file: %v", err)})
			return
		}
	}

	fullText := strings.TrimSpace(textInput + " " + extractedText)

	if fullText == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "No text provided for analysis"})
		return
	}

	analysis, err := analyzeWithOllama(fullText)

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": fmt.Sprintf("Analysis failed: %v", err)})
		return
	}

	processingTime := time.Since(startTime).String()
	analysis.ProcessingTime = processingTime

	c.JSON(http.StatusOK, analysis)
}

func extractTextFromFile(file io.Reader, filename string) (string, error) {
	ext := strings.ToLower(filepath.Ext(filename))

	switch ext {
	case ".pdf":
		return extractTextFromPDF(file)
	case ".doc", ".docx":
		return extractTextFromDOC(file)
	default:
		return "", fmt.Errorf("unsupported file type: %s", ext)
	}
}

func extractTextFromPDF(file io.Reader) (string, error) {
	content, err := io.ReadAll(file)

	if err != nil {
		return "", err
	}

	reader := bytes.NewReader(content)
	pdfReader, err := pdf.NewReader(reader, int64(len(content)))

	if err != nil {
		return "", err
	}

	var text strings.Builder
	numPages := pdfReader.NumPage()

	for i := 1; i <= numPages; i++ {
		page := pdfReader.Page(i)
		if page.V.IsNull() {
			continue
		}

		pageText, err := page.GetPlainText(nil)

		if err != nil {
			continue
		}
		text.WriteString(pageText)
	}

	return text.String(), nil
}

// TODO: Research DOC/DOCX file processing in the future
func extractTextFromDOC(file io.Reader) (string, error) {
	return "", fmt.Errorf("DOC/DOCX file processing is not supported for security reasons. Please copy and paste your CV text instead, or convert your document to PDF format")
}

func analyzeWithOllama(cvText string) (*CVAnalysisResponse, error) {
	prompt := fmt.Sprintf(`You are an expert HR professional and career coach. Analyze the following CV/resume and provide:

1. A score from 1-100 based on overall quality, structure, content, and presentation
2. Specific suggestions for improvement (3-5 key points)
3. A professional cover letter template based on the CV content

CV Content:
%s

Please respond ONLY with valid JSON in the following format. Do not include any text before or after the JSON. Ensure all strings are properly escaped:
{
  "score": [number between 1-100],
  "suggestions": ["suggestion 1", "suggestion 2", "suggestion 3"],
  "coverLetter": "Professional cover letter content here..."
}

Focus on:
- Content quality and relevance
- Structure and formatting
- Skills and experience presentation
- Professional language and tone
- ATS compatibility
- Industry-specific requirements`, cvText)

	reqBody := OllamaRequest{
		Model:  MODEL_NAME,
		Prompt: prompt,
		Stream: false,
	}

	jsonData, err := json.Marshal(reqBody)

	if err != nil {
		return nil, fmt.Errorf("failed to marshal request: %v", err)
	}

	resp, err := http.Post(OLLAMA_URL+"/api/generate", "application/json", bytes.NewBuffer(jsonData))
	if err != nil {
		return nil, fmt.Errorf("failed to connect to Ollama: %v. Please ensure Ollama is running and the model '%s' is installed", err, MODEL_NAME)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		body, _ := io.ReadAll(resp.Body)

		return nil, fmt.Errorf("Ollama returned status %d: %s", resp.StatusCode, string(body))
	}

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return nil, fmt.Errorf("failed to read Ollama response: %v", err)
	}

	var ollamaResp OllamaResponse
	err = json.Unmarshal(body, &ollamaResp)

	if err != nil {
		return nil, fmt.Errorf("failed to parse Ollama response: %v", err)
	}

	if ollamaResp.Error != "" {
		return nil, fmt.Errorf("Ollama error: %s", ollamaResp.Error)
	}

	if ollamaResp.Response == "" {
		return nil, fmt.Errorf("received empty response from Ollama")
	}

	cleanedResponse := cleanJSONResponse(ollamaResp.Response)
	var analysis CVAnalysisResponse
	err = json.Unmarshal([]byte(cleanedResponse), &analysis)

	if err != nil {

		log.Printf("Failed to parse JSON from Ollama. Raw response: %s", ollamaResp.Response)
		log.Printf("Cleaned response: %s", cleanedResponse)

		return nil, fmt.Errorf("failed to parse analysis JSON from Ollama: %v. The AI response was not in the expected format", err)
	}

	if len(analysis.Suggestions) == 0 {
		return nil, fmt.Errorf("no suggestions received from AI")
	}

	if analysis.CoverLetter == "" {
		return nil, fmt.Errorf("no cover letter received from AI")
	}

	return &analysis, nil
}

func checkOllamaHealth() bool {
	resp, err := http.Get(OLLAMA_URL + "/api/tags")
	if err != nil {
		return false
	}
	defer resp.Body.Close()
	return resp.StatusCode == http.StatusOK
}

func cleanJSONResponse(response string) string {
	response = strings.TrimSpace(response)
	start := strings.Index(response, "{")
	end := strings.LastIndex(response, "}")

	if start == -1 || end == -1 || start >= end {
		return response
	}

	jsonPart := response[start : end+1]

	var test map[string]interface{}

	if json.Unmarshal([]byte(jsonPart), &test) == nil {
		return jsonPart
	}

	simpleCleaned := strings.ReplaceAll(jsonPart, "\n", " ")
	simpleCleaned = strings.ReplaceAll(simpleCleaned, "\r", " ")
	simpleCleaned = strings.ReplaceAll(simpleCleaned, "\t", " ")

	for strings.Contains(simpleCleaned, "  ") {
		simpleCleaned = strings.ReplaceAll(simpleCleaned, "  ", " ")
	}

	if json.Unmarshal([]byte(simpleCleaned), &test) == nil {
		return simpleCleaned
	}

	re := regexp.MustCompile(`"([^"]*)"`)

	cleaned := re.ReplaceAllStringFunc(jsonPart, func(match string) string {
		content := match[1 : len(match)-1]
		content = strings.ReplaceAll(content, "\n", "\\n")
		content = strings.ReplaceAll(content, "\r", "\\r")
		content = strings.ReplaceAll(content, "\t", "\\t")
		content = strings.ReplaceAll(content, "\\", "\\\\")
		content = strings.ReplaceAll(content, "\\\\\"", "\\\"")

		return `"` + content + `"`
	})

	if json.Unmarshal([]byte(cleaned), &test) == nil {
		return cleaned
	}

	return simpleCleaned
}
