"use client";

import { useEffect, useState } from "react";

type AppliedJob = {
  jobid?: number;
  job_title: string;
  company_name: string;
  location: string;
  salary_formatted?: string;
  company_rating?: number;
};

type EmailData = {
  subject: string;
  body: string;
  isLoading: boolean;
};

export default function ApplyPage() {
  const [jobs, setJobs] = useState<AppliedJob[]>([]);
  const [selectedJob, setSelectedJob] = useState<AppliedJob | null>(null);
  const [emailData, setEmailData] = useState<EmailData>({
    subject: "",
    body: "",
    isLoading: false
  });
  const [showEmailModal, setShowEmailModal] = useState(false);

  useEffect(() => {
    // Get jobs from localStorage
    const stored = localStorage.getItem("appliedJobs");
    if (stored) {
      setJobs(JSON.parse(stored));
    }
  }, []);

  const handleApply = (jobid?: number) => {
    alert("Application sent! (Demo only)");
    // Here you could trigger a real application process
  };

  const generateEmail = async (job: AppliedJob) => {
    setSelectedJob(job);
    setShowEmailModal(true);
    setEmailData({ subject: "", body: "", isLoading: true });

    try {
      // Get resume from localStorage (assuming it's stored there from profile page)
      const resumeData = localStorage.getItem("resumeData") || "No resume uploaded";
      console.log("Resume data length:", resumeData.length);
      
      const requestBody = {
        job: {
          title: job.job_title,
          company: job.company_name,
          location: job.location,
          salary: job.salary_formatted,
          rating: job.company_rating
        },
        resume: resumeData
      };
      
      console.log("Sending request to API:", requestBody);
      
      const response = await fetch("/api/generate-email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });

      console.log("API response status:", response.status);

      if (!response.ok) {
        const errorData = await response.json();
        console.error("API error response:", errorData);
        throw new Error(`API Error: ${response.status} - ${errorData.error || 'Unknown error'}`);
      }

      const data = await response.json();
      console.log("API success response:", data);
      
      setEmailData({
        subject: data.subject,
        body: data.body,
        isLoading: false
      });
    } catch (error) {
      console.error("Error generating email:", error);
      setEmailData({
        subject: "Error",
        body: `Failed to generate email: ${error instanceof Error ? error.message : 'Unknown error'}. Please check your OpenAI API key configuration.`,
        isLoading: false
      });
    }
  };

  const copyToClipboard = async () => {
    const emailText = `Subject: ${emailData.subject}\n\n${emailData.body}`;
    try {
      await navigator.clipboard.writeText(emailText);
      alert("Email copied to clipboard!");
    } catch (error) {
      console.error("Failed to copy:", error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold text-center mb-8 text-blue-800">Jobs You Want to Apply To</h1>
        {jobs.length === 0 ? (
          <div className="text-center text-gray-500">You haven't swiped right on any jobs yet.</div>
        ) : (
          <ul className="space-y-6">
            {jobs.map((job, idx) => (
              <li key={job.jobid ?? `${job.job_title}-${job.company_name}-${idx}`} className="bg-white rounded-xl shadow p-6 flex flex-col md:flex-row md:items-center md:justify-between">
                <div>
                  <div className="font-bold text-lg text-blue-900">{job.job_title}</div>
                  <div className="text-blue-700">{job.company_name} &middot; {job.location}</div>
                  {job.salary_formatted && (
                    <div className="text-green-700 font-semibold mt-1">💰 {job.salary_formatted}</div>
                  )}
                  {job.company_rating !== undefined && (
                    <div className="text-yellow-600 font-semibold mt-1">⭐ {job.company_rating.toFixed(1)}</div>
                  )}
                </div>
                <div className="mt-4 md:mt-0 flex gap-2">
                  <button
                    className="bg-green-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-green-700 transition"
                    onClick={() => generateEmail(job)}
                  >
                    Generate Email
                  </button>
                  <button
                    className="bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-700 transition"
                    onClick={() => handleApply(job.jobid)}
                  >
                    Apply
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Email Modal */}
      {showEmailModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-blue-900">
                  Generated Email for {selectedJob?.job_title} at {selectedJob?.company_name}
                </h2>
                <button
                  onClick={() => setShowEmailModal(false)}
                  className="text-gray-500 hover:text-gray-700 text-2xl"
                >
                  ×
                </button>
              </div>
              
              {emailData.isLoading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="mt-4 text-gray-600">Generating your custom email...</p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Subject:</label>
                    <div className="bg-gray-50 p-3 rounded border text-gray-700">{emailData.subject}</div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email Body:</label>
                    <div className="bg-gray-50 p-3 rounded border whitespace-pre-wrap text-gray-700">{emailData.body}</div>
                  </div>
                  <div className="flex gap-2 pt-4">
                    <button
                      onClick={copyToClipboard}
                      className="bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-700 transition"
                    >
                      Copy to Clipboard
                    </button>
                    <button
                      onClick={() => setShowEmailModal(false)}
                      className="bg-gray-500 text-white px-4 py-2 rounded-lg font-semibold hover:bg-gray-600 transition"
                    >
                      Close
                    </button>
                  </div>
                </div>
              )}
            </div>
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
  );
}
