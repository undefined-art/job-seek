export interface CVAnalysisResponse {
  score: number;
  suggestions: string[];
  coverLetter: string;
  processingTime: string;
}

export interface AnalysisError {
  error: string;
}

export type AnalysisResult = CVAnalysisResponse | AnalysisError;

export interface FileUploadProps {
  onAnalysis: (formData: FormData) => Promise<void>;
}

export interface TextInputProps {
  onAnalysis: (formData: FormData) => Promise<void>;
}

export interface AnalysisResultsProps {
  analysis: CVAnalysisResponse;
}
