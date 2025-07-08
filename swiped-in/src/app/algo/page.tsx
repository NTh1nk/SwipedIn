"use client";

import { useEffect, useState } from "react";

interface JobRecommendation {
  job: {
    id?: number;
    jobid?: number;
    job_title?: string;
    title?: string;
    company_name?: string;
    company?: string;
    location?: string;
    job_location?: string;
    description?: string;
    description_text?: string;
    job_description?: string;
    [key: string]: any;
  };
  similarity_score: number;
  rank: number;
  matched_keywords?: string[];
}

export default function AlgoPage() {
  const [recommendations, setRecommendations] = useState<JobRecommendation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [resumeText, setResumeText] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Load resume from localStorage or use default
  useEffect(() => {
    const savedResume = localStorage.getItem('resumeText');
    if (savedResume) {
      setResumeText(savedResume);
      getJobRecommendations(savedResume);
    } else {
      const defaultResume = "Machine learning engineer with 3 years of experience in Python, PyTorch, and natural language processing. Skilled in building and deploying ML models, working with large datasets, and collaborating with cross-functional teams.";
      setResumeText(defaultResume);
      getJobRecommendations(defaultResume);
    }
    // eslint-disable-next-line
  }, []);

  const getJobRecommendations = async (resume: string) => {
    setIsAnalyzing(true);
    setError(null);
    setLoading(true);
    try {
      const response = await fetch('/api/job-recommendations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ resume }),
      });
      if (!response.ok) {
        throw new Error('Failed to get job recommendations');
      }
      const data = await response.json();
      setRecommendations(data.recommendations || []);
      setLoading(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      setLoading(false);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleAnalyzeResume = () => {
    if (resumeText.trim()) {
      localStorage.setItem('resumeText', resumeText);
      getJobRecommendations(resumeText);
    }
  };

  const formatJobInfo = (job: any) => {
    return {
      title: job.job_title || job.title || 'Unknown Position',
      company: job.company_name || job.company || 'Unknown Company',
      location: job.location || job.job_location || 'Unknown Location',
      description: job.description || job.description_text || job.job_description || 'No description available'
    };
  };

  return (
    <div className="min-h-screen bg-white text-black p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Algorithmic Job Recommendations</h1>
        {/* Resume Input Section */}
        <div className="bg-gray-50 rounded-xl p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Resume Analysis</h2>
          <textarea
            value={resumeText}
            onChange={(e) => setResumeText(e.target.value)}
            placeholder="Paste your resume text here..."
            className="w-full h-32 p-3 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <div className="mt-4 flex gap-4">
            <button
              onClick={handleAnalyzeResume}
              disabled={isAnalyzing || !resumeText.trim()}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isAnalyzing ? 'Analyzing...' : 'Get Job Recommendations'}
            </button>
            <button
              onClick={() => {
                setResumeText("Garbage collector.");
                localStorage.setItem('resumeText', "Garbage collector.");
                getJobRecommendations("Garbage collector.");
              }}
              className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700"
            >
              Test with Sample
            </button>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-600">Error: {error}</p>
          </div>
        )}

        {/* Job Recommendations */}
        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading job recommendations...</p>
          </div>
        ) : recommendations.length > 0 ? (
          <div>
            <h2 className="text-2xl font-semibold mb-4">
              Top {recommendations.length} Job Recommendations
            </h2>
            <div className="grid gap-6">
              {recommendations.map((rec) => {
                const jobInfo = formatJobInfo(rec.job);
                return (
                  <div key={rec.rank} className="bg-blue-50 rounded-xl shadow-lg p-6 border-l-4 border-blue-600">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h3 className="text-xl font-semibold text-blue-900">{jobInfo.title}</h3>
                        <p className="text-blue-800 font-medium">{jobInfo.company}</p>
                        <p className="text-sm text-gray-600">{jobInfo.location}</p>
                      </div>
                      <div className="text-right">
                        <div className="bg-blue-600 text-white px-3 py-1 rounded-full text-sm font-medium">
                          Rank #{rec.rank}
                        </div>
                        <div className="text-sm text-gray-600 mt-1">
                          Match: {(rec.similarity_score * 100).toFixed(1)}%
                        </div>
                      </div>
                    </div>
                    {rec.matched_keywords && rec.matched_keywords.length > 0 && (
                      <div className="mb-3">
                        <p className="text-sm text-gray-600 mb-1">Matched Keywords:</p>
                        <div className="flex flex-wrap gap-1">
                          {rec.matched_keywords.map((keyword, idx) => (
                            <span
                              key={idx}
                              className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full"
                            >
                              {keyword}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    <p className="text-gray-800 leading-relaxed">{jobInfo.description}</p>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-600 text-lg">
              Enter your resume text above and click "Get Job Recommendations" to see personalized job matches.
            </p>
          </div>
        )}
      </div>
    </div>
  );
} 