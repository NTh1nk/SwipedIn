"use client";
import { useState } from "react";

export default function ResumeSummaryPage() {
  const [resumeText, setResumeText] = useState("");
  const [summary, setSummary] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSummarize = async () => {
    setLoading(true);
    setError("");
    setSummary("");
    try {
      const res = await fetch("/api/summarize-resume", {
        method: "POST",
        headers: { "Content-Type": "application/json" },    
        body: JSON.stringify({ resume: resumeText }),
      });
      if (!res.ok) throw new Error("Failed to summarize resume");
      const data = await res.json();
      setSummary(data.summary);
    } catch (err: any) {
      setError(err.message || "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-12 px-4">
      <h1 className="text-3xl font-bold mb-6 text-center">Resume Summarizer</h1>
      <div className="mb-4">
        <label htmlFor="resume" className="block font-medium mb-2">
          Paste your resume below:
        </label>
        <textarea
          id="resume"
          className="w-full border rounded-md p-3 min-h-[180px] focus:outline-none focus:ring-2 focus:ring-blue-400"
          value={resumeText}
          onChange={e => setResumeText(e.target.value)}
          placeholder="Paste your resume here..."
          rows={10}
        />
      </div>
      <button
        className="bg-blue-600 text-white px-6 py-2 rounded-md font-semibold hover:bg-blue-700 transition disabled:opacity-50"
        onClick={handleSummarize}
        disabled={loading || !resumeText.trim()}
      >
        {loading ? "Summarizing..." : "Summarize Resume"}
      </button>
      {error && (
        <div className="mt-4 text-red-600 font-medium">{error}</div>
      )}
      {summary && !error && (
        <div className="mt-8 bg-gray-50 border rounded-md p-4 shadow">
          <h2 className="text-xl font-semibold mb-2">Summary</h2>
          <p className="whitespace-pre-line text-gray-800">{summary}</p>
        </div>
      )}
    </div>
  );
}
