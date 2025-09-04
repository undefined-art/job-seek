"use client";

import { useState } from "react";
import { Star, Lightbulb, FileText, Copy, Check, Clock } from "lucide-react";
import { AnalysisResultsProps } from "@/types/cv";
import { getScoreColor, getScoreLabel } from "@/lib/utils";

export function AnalysisResults({ analysis }: AnalysisResultsProps) {
  const [copiedSuggestion, setCopiedSuggestion] = useState<number | null>(null);
  const [copiedCoverLetter, setCopiedCoverLetter] = useState(false);

  const copyToClipboard = async (
    text: string,
    type: "suggestion" | "coverLetter",
    index?: number
  ) => {
    try {
      await navigator.clipboard.writeText(text);
      if (type === "suggestion" && index !== undefined) {
        setCopiedSuggestion(index);
        setTimeout(() => setCopiedSuggestion(null), 2000);
      } else if (type === "coverLetter") {
        setCopiedCoverLetter(true);
        setTimeout(() => setCopiedCoverLetter(false), 2000);
      }
    } catch (err) {
      console.error("Failed to copy text: ", err);
    }
  };

  return (
    <div className="space-y-6">
      <div className="card text-center">
        <div className="flex items-center justify-center space-x-2 mb-4">
          <Star className="w-6 h-6 text-yellow-500" />
          <h3 className="text-2xl font-bold">CV Score</h3>
        </div>

        <div className="flex items-center justify-center space-x-4 mb-4">
          <div
            className={`text-4xl font-bold ${getScoreColor(analysis.score)}`}
          >
            {analysis.score}
          </div>
          <div className="text-left">
            <div
              className={`text-lg font-semibold ${getScoreColor(
                analysis.score
              )}`}
            >
              {getScoreLabel(analysis.score)}
            </div>
            <div className="text-sm text-gray-600">out of 100</div>
          </div>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3">
          <div
            className={`h-3 rounded-full transition-all duration-500 ${
              analysis.score >= 80
                ? "bg-success-500"
                : analysis.score >= 60
                ? "bg-primary-500"
                : analysis.score >= 40
                ? "bg-warning-500"
                : "bg-error-500"
            }`}
            style={{ width: `${analysis.score}%` }}
          />
        </div>
        <div className="flex items-center justify-center space-x-1 mt-4 text-sm text-gray-600">
          <Clock className="w-4 h-4" />
          <span>Processed in {analysis.processingTime}</span>
        </div>
      </div>
      <div className="card">
        <div className="flex items-center space-x-2 mb-6">
          <Lightbulb className="w-6 h-6 text-yellow-500" />
          <h3 className="text-2xl font-bold">Improvement Suggestions</h3>
        </div>
        <div className="space-y-4">
          {analysis.suggestions.map((suggestion, index) => (
            <div
              key={index}
              className="flex items-start space-x-3 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <div className="flex-shrink-0 w-6 h-6 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center text-sm font-semibold">
                {index + 1}
              </div>
              <div className="flex-1">
                <p className="text-gray-900">{suggestion}</p>
              </div>
              <button
                onClick={() => copyToClipboard(suggestion, "suggestion", index)}
                className="flex-shrink-0 p-2 text-gray-400 hover:text-gray-600 transition-colors"
                title="Copy suggestion"
              >
                {copiedSuggestion === index ? (
                  <Check className="w-4 h-4 text-green-600" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </button>
            </div>
          ))}
        </div>
      </div>
      <div className="card">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-2">
            <FileText className="w-6 h-6 text-blue-500" />
            <h3 className="text-2xl font-bold">Generated Cover Letter</h3>
          </div>
          <button
            onClick={() => copyToClipboard(analysis.coverLetter, "coverLetter")}
            className="btn-secondary flex items-center space-x-2"
          >
            {copiedCoverLetter ? (
              <>
                <Check className="w-4 h-4" />
                <span>Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                <span>Copy</span>
              </>
            )}
          </button>
        </div>
        <div className="bg-gray-50 rounded-lg p-6">
          <div className="prose prose-sm max-w-none">
            <pre className="whitespace-pre-wrap font-sans text-gray-900 leading-relaxed">
              {analysis.coverLetter}
            </pre>
          </div>
        </div>
        <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-800">
            <strong>Note:</strong> This is a template cover letter generated
            based on your CV. Please customize it further to match the specific
            job requirements and company you're applying to.
          </p>
        </div>
      </div>
      <div className="flex flex-col sm:flex-row gap-4">
        <button
          onClick={() => window.location.reload()}
          className="btn-primary flex-1"
        >
          Analyze Another CV
        </button>
        <button
          onClick={() => {
            const text = `CV Score: ${
              analysis.score
            }/100\n\nSuggestions:\n${analysis.suggestions
              .map((s, i) => `${i + 1}. ${s}`)
              .join("\n")}\n\nCover Letter:\n${analysis.coverLetter}`;
            copyToClipboard(text, "coverLetter");
          }}
          className="btn-secondary flex-1"
        >
          Copy All Results
        </button>
      </div>
    </div>
  );
}
