"use client";

import { useState } from "react";
import { FileText, Shield, Zap, CheckCircle, AlertCircle } from "lucide-react";
import { CVAnalysisResponse } from "@/types/cv";
import { analyzeCV } from "@/lib/api";
import { FileUpload } from "@/components/FileUpload";
import { TextInput } from "@/components/TextInput";
import { AnalysisResults } from "@/components/AnalysisResults";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { HealthStatus } from "@/components/HealthStatus";

export default function Home() {
  const [analysis, setAnalysis] = useState<CVAnalysisResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [systemHealthy, setSystemHealthy] = useState(false);

  const handleAnalysis = async (formData: FormData) => {
    setLoading(true);
    setError(null);
    setAnalysis(null);

    try {
      const result = await analyzeCV(formData);
      setAnalysis(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Analysis failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
                <FileText className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-xl font-bold text-gray-900">Job Seek</h1>
            </div>
            <div className="flex items-center space-x-4 text-sm text-gray-600">
              <HealthStatus onStatusChange={setSystemHealthy} />
            </div>
          </div>
        </div>
      </header>
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Analyze Your CV with{" "}
            <span className="text-primary-600">Local AI</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto text-balance">
            Get professional CV analysis, improvement suggestions, and
            personalized cover letters. All processing happens locally on your
            device - your data never leaves your computer.
          </p>
        </div>
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <div className="card text-center">
            <Shield className="w-12 h-12 text-green-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Privacy-First</h3>
            <p className="text-gray-600">
              Your CV data is processed locally using Ollama. No external APIs
              or cloud services.
            </p>
          </div>
          <div className="card text-center">
            <Zap className="w-12 h-12 text-blue-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">
              Ultralight Performance
            </h3>
            <p className="text-gray-600">
              Optimized for speed and efficiency. Fast analysis with minimal
              resource usage.
            </p>
          </div>
          <div className="card text-center">
            <CheckCircle className="w-12 h-12 text-purple-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">
              Comprehensive Analysis
            </h3>
            <p className="text-gray-600">
              Get detailed scoring, improvement suggestions, and AI-generated
              cover letters.
            </p>
          </div>
        </div>
        {!systemHealthy && (
          <div className="max-w-4xl mx-auto mb-6">
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-center">
                <AlertCircle className="w-5 h-5 text-yellow-600 mr-2" />
                <div>
                  <p className="text-yellow-800 font-medium">
                    System Not Ready
                  </p>
                  <p className="text-yellow-700 text-sm">
                    The AI service is not available. Please ensure Ollama is
                    running and the model is installed.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
        <div className="max-w-4xl mx-auto">
          <div className="card">
            <h3 className="text-2xl font-bold mb-6 text-center">
              Upload Your CV
            </h3>
            {loading && (
              <div className="text-center py-8">
                <LoadingSpinner />
                <p className="text-gray-600 mt-4">Analyzing your CV...</p>
              </div>
            )}
            {error && (
              <div className="mb-6 p-4 bg-error-50 border border-error-200 rounded-lg">
                <div className="flex items-center">
                  <AlertCircle className="w-5 h-5 text-error-600 mr-2" />
                  <p className="text-error-800">{error}</p>
                </div>
              </div>
            )}
            {!loading && (
              <div className="space-y-6">
                <FileUpload onAnalysis={handleAnalysis} />
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-300" />
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-white text-gray-500">
                      Or paste your CV text
                    </span>
                  </div>
                </div>
                <TextInput onAnalysis={handleAnalysis} />
              </div>
            )}
          </div>
          {analysis && (
            <div className="mt-8 animate-fade-in">
              <AnalysisResults analysis={analysis} />
            </div>
          )}
        </div>
        <footer className="mt-16 text-center text-gray-600">
          <div className="flex items-center justify-center space-x-4 mb-4">
            <div className="flex items-center space-x-1">
              <Shield className="w-4 h-4" />
              <span>100% Local Processing</span>
            </div>
          </div>
          <p className="text-sm">Built with ❤️ by Monulph 🇵🇱</p>
        </footer>
      </main>
    </div>
  );
}
