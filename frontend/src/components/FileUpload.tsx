"use client";

import { useState, useRef } from "react";
import { Upload, FileText, X, AlertCircle } from "lucide-react";
import { FileUploadProps } from "@/types/cv";
import {
  validateFileType,
  validateFileSize,
  formatFileSize,
} from "@/lib/utils";

export function FileUpload({ onAnalysis }: FileUploadProps) {
  const [file, setFile] = useState<File | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleFile = (selectedFile: File) => {
    setError(null);

    if (!validateFileType(selectedFile)) {
      setError(
        "Please upload a PDF file. For DOC/DOCX files, please copy and paste the text content instead."
      );

      return;
    }

    if (!validateFileSize(selectedFile)) {
      setError("File size must be less than 10MB");

      return;
    }

    setFile(selectedFile);
  };

  const removeFile = () => {
    setFile(null);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSubmit = async () => {
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    await onAnalysis(formData);
  };

  return (
    <div className="space-y-4">
      <div
        className={`file-upload ${
          dragActive ? "border-primary-500 bg-primary-50" : ""
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf"
          onChange={handleFileInput}
          className="hidden"
        />

        <div className="space-y-4">
          <Upload className="w-12 h-12 text-gray-400 mx-auto" />
          <div>
            <p className="text-lg font-medium text-gray-900">
              {file ? file.name : "Drop your CV here or click to browse"}
            </p>
            <p className="text-sm text-gray-500 mt-1">
              Supports PDF files up to 10MB. For DOC/DOCX files, use the text
              input below.
            </p>
          </div>
        </div>
      </div>
      {file && (
        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center space-x-3">
            <FileText className="w-5 h-5 text-gray-600" />
            <div>
              <p className="text-sm font-medium text-gray-900">{file.name}</p>
              <p className="text-xs text-gray-500">
                {formatFileSize(file.size)}
              </p>
            </div>
          </div>
          <button
            onClick={removeFile}
            className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}
      {error && (
        <div className="flex items-center space-x-2 text-error-600">
          <AlertCircle className="w-4 h-4" />
          <p className="text-sm">{error}</p>
        </div>
      )}
      {file && (
        <button onClick={handleSubmit} className="btn-primary w-full">
          Analyze CV
        </button>
      )}
    </div>
  );
}
