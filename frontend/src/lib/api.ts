import { CVAnalysisResponse } from "@/types/cv";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

export async function analyzeCV(
  formData: FormData
): Promise<CVAnalysisResponse> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/analyze`, {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      let errorMessage = `HTTP error! status: ${response.status}`;

      try {
        const errorData = await response.json();

        errorMessage = errorData.error || errorMessage;
      } catch {
        errorMessage = response.statusText || errorMessage;
      }

      throw new Error(errorMessage);
    }

    const data: CVAnalysisResponse = await response.json();
    return data;
  } catch (error) {
    if (error instanceof Error) {
      if (error.message.includes("fetch")) {
        throw new Error(
          "Cannot connect to the backend server. Please ensure the backend is running on port 8080."
        );
      }

      if (error.message.includes("Ollama")) {
        throw new Error(
          "AI service error: " +
            error.message +
            ". Please ensure Ollama is running and the model is installed."
        );
      }

      throw error;
    }

    throw new Error("Failed to analyze CV - unknown error occurred");
  }
}

export async function checkHealth(): Promise<{
  healthy: boolean;
  message: string;
  ollamaAvailable: boolean;
}> {
  try {
    const response = await fetch(`${API_BASE_URL}/health`);

    if (response.ok) {
      const data = await response.json();

      return {
        healthy: true,
        message: data.status || "Backend is healthy",
        ollamaAvailable: data.ollama_available || false,
      };
    }
    return {
      healthy: false,
      message: `Backend returned status ${response.status}`,
      ollamaAvailable: false,
    };
  } catch (error) {
    console.error("Error checking health:", error);

    return {
      healthy: false,
      message: "Cannot connect to backend server",
      ollamaAvailable: false,
    };
  }
}
