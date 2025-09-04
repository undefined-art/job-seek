"use client";

import { useState } from "react";
import { FileText } from "lucide-react";
import { TextInputProps } from "@/types/cv";

export function TextInput({ onAnalysis }: TextInputProps) {
  const [text, setText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!text.trim()) return;

    setIsSubmitting(true);

    try {
      const formData = new FormData();
      formData.append("text", text.trim());
      await onAnalysis(formData);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label
          htmlFor="cv-text"
          className="block text-sm font-medium text-gray-700 mb-2"
        >
          Paste your CV text here
        </label>
        <textarea
          id="cv-text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Paste your CV content here... Include your experience, skills, education, and any other relevant information."
          className="textarea h-32"
          rows={6}
        />
        <p className="text-xs text-gray-500 mt-1">{text.length} characters</p>
      </div>

      <button
        type="submit"
        disabled={!text.trim() || isSubmitting}
        className="btn-primary w-full flex items-center justify-center space-x-2"
      >
        {isSubmitting ? (
          <>
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            <span>Analyzing...</span>
          </>
        ) : (
          <>
            <FileText className="w-4 h-4" />
            <span>Analyze Text</span>
          </>
        )}
      </button>
    </form>
  );
}
