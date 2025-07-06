"use client";

import { useRef, useState } from "react";
import { extractTextFromFile, cleanResumeText } from "@/lib/resumeUtils";

const JOB_CATEGORIES = [
  "Software",
  "Engineering",
  "Product",
  "Design",
  "Marketing",
  "Sales",
  "Operations",
  "Finance",
  "HR",
  "Customer Support",
  "Other"
];

export default function ProfilePage() {
  const [resume, setResume] = useState<File | null>(null);
  const [resumeText, setResumeText] = useState<string>("");
  const [summary, setSummary] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const options = Array.from(e.target.selectedOptions).map(opt => opt.value);
    setSelectedCategories(options);
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setResume(file);
      
      // Use the utility function to extract text from the file
      try {
        const text = await extractTextFromFile(file);
        setResumeText(text);
        // Store in localStorage for email generation
        localStorage.setItem("resumeData", text);
        setError(""); // Clear any previous errors
      } catch (error: any) {
        console.error("Error reading file:", error);
        setError(error.message || "Failed to read file");
        // If we can't read the file, store the filename as fallback
        localStorage.setItem("resumeData", `Resume file: ${file.name}`);
      }
    }
  };
  const handleSaveResume = async () => {
    if (!resumeText.trim()) {
      setError("Please provide resume text to save.");
      return;
    }
    localStorage.setItem("resumeData", resumeText);
    console.log("Resume saved to localStorage: " + resumeText);
    alert("saved resume");
  }

  const handleSummarize = async () => {
    if (!resumeText.trim()) {
      setError("Please provide resume text to summarize.");
      return;
    }

    setLoading(true);
    setError("");
    setSummary("");
    
    try {
      const res = await fetch("/api/summarize-resume", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resume: resumeText }),
      });
      
      if (!res.ok) {
        throw new Error("Failed to summarize resume");
      }
      
      const data = await res.json();
      setSummary(data.summary);
    } catch (err: any) {
      setError(err.message || "Failed to generate summary");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-center mb-8 text-gray-800">Resume Analyzer</h1>
        
        {/* Category Selection */} {/* TODO: Add category selection 
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-900">Select Job Categories</h2>
          <select
            multiple
            value={selectedCategories}
            onChange={handleCategoryChange}
            className="w-full border text-gray-900 border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            {JOB_CATEGORIES.map(category => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>
          <div className="mt-2 text-sm text-gray-900">
            {selectedCategories.length > 0
              ? `Selected: ${selectedCategories.join(", ")}`
              : "No categories selected"}
          </div>
        </div>*/}

        {/* File Upload Section */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-900">Upload Resume</h2>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-900 mb-2">
              Upload your resume (PDF, DOCX, or TXT):
            </label>
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.doc,.docx,.txt"
              onChange={handleFileChange}
              className="w-full file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 transition-colors"
            />
          </div>
          {resume && (
            <div className="text-green-600 font-medium">
              ✓ Selected: {resume.name}
            </div>
          )}
        </div>

        {/* Manual Text Input Section */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-900">Resume Text</h2>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-900 mb-2">
              Paste your resume text here:
            </label>
            <textarea
              value={resumeText}
              onChange={(e) => setResumeText(e.target.value)}
              placeholder="Paste your resume content here..."
              rows={12}
              className="w-full border text-gray-900 border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />  
          </div>
          
          {error && (
            <div className="text-red-600 text-sm mb-4">{error}</div>
          )}
          
          <button
            onClick={handleSaveResume}
            disabled={loading || !resumeText.trim()}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Saving resume..." : "Save resume"}
          </button>
        </div>

        {/* Summary Section */}
        {summary && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">AI-Generated Summary</h2>
            <div className="bg-gray-50 rounded-lg p-4 border-l-4 border-blue-500">
              <p className="whitespace-pre-line text-gray-800 leading-relaxed">
                {summary}
              </p>
            </div>
          </div>
        )}

        <div className="mt-8 text-center">
          <a
            href="/game"
            className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Start Swipin'
          </a>
        </div>
      </div>
    </div>
  );
}
