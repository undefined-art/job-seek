package main

import (
	"bytes"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"net/url"
	"strings"
	"testing"

	"github.com/gin-gonic/gin"
)

func init() {
	gin.SetMode(gin.TestMode)
}

func TestCleanJSONResponse(t *testing.T) {
	tests := []struct {
		name     string
		input    string
		expected string
	}{
		{
			name:     "already valid JSON",
			input:    `{"score": 85, "suggestions": ["a"], "coverLetter": "b"}`,
			expected: `{"score": 85, "suggestions": ["a"], "coverLetter": "b"}`,
		},
		{
			name:     "markdown fenced JSON",
			input:    "```json\n{\"score\": 90}\n```",
			expected: "{\"score\": 90}",
		},
		{
			name:     "JSON with prose before and after",
			input:    "Here is your analysis:\n{\"score\": 70}\nHope that helps.",
			expected: "{\"score\": 70}",
		},
		{
			name:     "whitespace only",
			input:    "   \n\t  ",
			expected: "",
		},
		{
			name:     "no braces present",
			input:    "no json here",
			expected: "no json here",
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			if got := cleanJSONResponse(tt.input); got != tt.expected {
				t.Errorf("cleanJSONResponse(%q) = %q, want %q", tt.input, got, tt.expected)
			}
		})
	}
}

func TestExtractTextFromFile(t *testing.T) {
	tests := []struct {
		name     string
		filename string
		wantErr  bool
		errSub   string
	}{
		{
			name:     "unsupported extension",
			filename: "resume.txt",
			wantErr:  true,
			errSub:   "unsupported file type",
		},
		{
			name:     "doc extension rejected for security",
			filename: "resume.doc",
			wantErr:  true,
			errSub:   "not supported for security reasons",
		},
		{
			name:     "docx extension rejected for security",
			filename: "resume.docx",
			wantErr:  true,
			errSub:   "not supported for security reasons",
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			_, err := extractTextFromFile(bytes.NewReader([]byte("data")), tt.filename)

			if !tt.wantErr {
				if err != nil {
					t.Fatalf("unexpected error: %v", err)
				}
				return
			}

			if err == nil {
				t.Fatal("expected error, got nil")
			}

			if tt.errSub != "" && !strings.Contains(err.Error(), tt.errSub) {
				t.Errorf("error %q does not contain %q", err.Error(), tt.errSub)
			}
		})
	}
}

func TestAnalyzeWithOllama(t *testing.T) {
	srv := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if r.URL.Path != "/api/generate" {
			t.Errorf("unexpected path: %s", r.URL.Path)
		}

		response := OllamaResponse{
			Response: `{"score": 88, "suggestions": ["Improve summary", "Add metrics"], "coverLetter": "Dear hiring manager..."}`,
			Done:     true,
		}

		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(response)
	}))
	defer srv.Close()

	oldURL := ollamaURL
	ollamaURL = srv.URL
	defer func() { ollamaURL = oldURL }()

	result, err := analyzeWithOllama("John Doe, Software Engineer")

	if err != nil {
		t.Fatalf("analyzeWithOllama returned error: %v", err)
	}

	if result.Score != 88 {
		t.Errorf("score = %d, want 88", result.Score)
	}

	if len(result.Suggestions) != 2 {
		t.Errorf("len(suggestions) = %d, want 2", len(result.Suggestions))
	}

	if result.CoverLetter == "" {
		t.Error("cover letter should not be empty")
	}
}

func TestAnalyzeWithOllamaHTTPError(t *testing.T) {
	srv := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusInternalServerError)
		w.Write([]byte("internal error"))
	}))
	defer srv.Close()

	oldURL := ollamaURL
	ollamaURL = srv.URL
	defer func() { ollamaURL = oldURL }()

	_, err := analyzeWithOllama("some text")

	if err == nil {
		t.Fatal("expected error, got nil")
	}

	if !strings.Contains(err.Error(), "Ollama returned status 500") {
		t.Errorf("unexpected error: %v", err)
	}
}

func TestAnalyzeWithOllamaConnectionFailure(t *testing.T) {
	oldURL := ollamaURL
	ollamaURL = "http://127.0.0.1:1"
	defer func() { ollamaURL = oldURL }()

	_, err := analyzeWithOllama("some text")

	if err == nil {
		t.Fatal("expected error, got nil")
	}

	if !strings.Contains(err.Error(), "failed to connect to Ollama") {
		t.Errorf("unexpected error: %v", err)
	}
}

func TestCheckOllamaHealth(t *testing.T) {
	srv := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusOK)
	}))
	defer srv.Close()

	oldURL := ollamaURL
	ollamaURL = srv.URL
	defer func() { ollamaURL = oldURL }()

	if !checkOllamaHealth() {
		t.Error("expected health to be true for 200 response")
	}

	srv500 := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusServiceUnavailable)
	}))
	defer srv500.Close()

	ollamaURL = srv500.URL
	if checkOllamaHealth() {
		t.Error("expected health to be false for non-200 response")
	}
}

func TestHealthEndpoint(t *testing.T) {
	router := newRouter()

	req := httptest.NewRequest(http.MethodGet, "/health", nil)
	w := httptest.NewRecorder()

	router.ServeHTTP(w, req)

	if w.Code != http.StatusOK {
		t.Errorf("status = %d, want %d", w.Code, http.StatusOK)
	}

	var body map[string]interface{}
	if err := json.Unmarshal(w.Body.Bytes(), &body); err != nil {
		t.Fatalf("invalid JSON response: %v", err)
	}

	if _, ok := body["status"]; !ok {
		t.Error("health response missing status field")
	}

	if _, ok := body["ollama_available"]; !ok {
		t.Error("health response missing ollama_available field")
	}
}

func TestAnalyzeEndpointWithText(t *testing.T) {
	srv := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		response := OllamaResponse{
			Response: `{"score": 80, "suggestions": ["s1"], "coverLetter": "letter"}`,
			Done:     true,
		}
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(response)
	}))
	defer srv.Close()

	oldURL := ollamaURL
	ollamaURL = srv.URL
	defer func() { ollamaURL = oldURL }()

	router := newRouter()

	body := strings.NewReader(url.Values{"text": {"Software engineer with 5 years experience"}}.Encode())

	req := httptest.NewRequest(http.MethodPost, "/api/analyze", body)
	req.Header.Set("Content-Type", "application/x-www-form-urlencoded")
	w := httptest.NewRecorder()

	router.ServeHTTP(w, req)

	if w.Code != http.StatusOK {
		t.Errorf("status = %d, want 200. Body: %s", w.Code, w.Body.String())
	}

	var analysis CVAnalysisResponse
	if err := json.Unmarshal(w.Body.Bytes(), &analysis); err != nil {
		t.Fatalf("invalid JSON response: %v", err)
	}

	if analysis.Score != 80 {
		t.Errorf("score = %d, want 80", analysis.Score)
	}

	if analysis.ProcessingTime == "" {
		t.Error("processingTime should not be empty")
	}
}

func TestAnalyzeEndpointNoContent(t *testing.T) {
	router := newRouter()

	body := strings.NewReader("text=")

	req := httptest.NewRequest(http.MethodPost, "/api/analyze", body)
	req.Header.Set("Content-Type", "application/x-www-form-urlencoded")
	w := httptest.NewRecorder()

	router.ServeHTTP(w, req)

	if w.Code != http.StatusBadRequest {
		t.Errorf("status = %d, want %d", w.Code, http.StatusBadRequest)
	}
}
