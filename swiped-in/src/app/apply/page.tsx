"use client";

import { useEffect, useState } from "react";

type AppliedJob = {
  jobid?: number;
  job_title: string;
  company_name: string;
  location: string;
  salary_formatted?: string;
  company_rating?: number;
  apply_link?: string;
};

type EmailData = {
  subject: string;
  body: string;
  isLoading: boolean;
};

export default function ApplyPage() {
  const [jobs, setJobs] = useState<AppliedJob[]>([]);
  const [archivedJobs, setArchivedJobs] = useState<AppliedJob[]>([]);
  const [showArchived, setShowArchived] = useState(false);
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
    
    // Get archived jobs from localStorage
    const storedArchived = localStorage.getItem("archivedJobs");
    if (storedArchived) {
      setArchivedJobs(JSON.parse(storedArchived));
    }
  }, []);

  const handleApply = (jobid?: number) => {
  
    const applicationLink = jobs.find(job => job.jobid === jobid)?.apply_link;
    if (applicationLink) {
      window.open(applicationLink);
    } else {
      alert("No application link found for this job.");
      console.log("jobs" + jobs);
    } 

    // Here you could trigger a real application process
  };

  const handleArchive = (jobToArchive: AppliedJob) => {
    // Remove from active jobs
    const updatedJobs = jobs.filter(job => 
      job.jobid !== jobToArchive.jobid || 
      job.job_title !== jobToArchive.job_title || 
      job.company_name !== jobToArchive.company_name
    );
    setJobs(updatedJobs);
    localStorage.setItem("appliedJobs", JSON.stringify(updatedJobs));
    
    // Add to archived jobs
    const updatedArchivedJobs = [...archivedJobs, jobToArchive];
    setArchivedJobs(updatedArchivedJobs);
    localStorage.setItem("archivedJobs", JSON.stringify(updatedArchivedJobs));
  };

  const handleUnarchive = (jobToUnarchive: AppliedJob) => {
    // Remove from archived jobs
    const updatedArchivedJobs = archivedJobs.filter(job => 
      job.jobid !== jobToUnarchive.jobid || 
      job.job_title !== jobToUnarchive.job_title || 
      job.company_name !== jobToUnarchive.company_name
    );
    setArchivedJobs(updatedArchivedJobs);
    localStorage.setItem("archivedJobs", JSON.stringify(updatedArchivedJobs));
    
    // Add back to active jobs
    const updatedJobs = [...jobs, jobToUnarchive];
    setJobs(updatedJobs);
    localStorage.setItem("appliedJobs", JSON.stringify(updatedJobs));
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
          rating: job.company_rating,
          apply_link: job.apply_link
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
      {/* Profile Icon */}
      <div className="absolute top-4 right-4">
        <a
          href="/profile"
          className="shadow-md hover:shadow-lg transition-shadow duration-200"
          title="Go to Profile"
        >
          <svg
            className="w-6 h-6 text-blue-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
            />
          </svg>
        </a>
      </div>
      
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold text-center mb-8 text-blue-800">
          {showArchived ? "Archived Jobs" : "Jobs You Want to Apply To"}
        </h1>
        
        {/* Toggle between active and archived jobs */}
        <div className="flex justify-center mb-6">
          <div className="bg-white rounded-lg shadow p-1 flex">
            <button
              onClick={() => setShowArchived(false)}
              className={`px-4 py-2 rounded-md font-medium transition ${
                !showArchived
                  ? "bg-blue-600 text-white"
                  : "text-gray-600 hover:text-gray-800"
              }`}
            >
              Active ({jobs.length})
            </button>
            <button
              onClick={() => setShowArchived(true)}
              className={`px-4 py-2 rounded-md font-medium transition ${
                showArchived
                  ? "bg-blue-600 text-white"
                  : "text-gray-600 hover:text-gray-800"
              }`}
            >
              Archived ({archivedJobs.length})
            </button>
          </div>
        </div>

        {showArchived ? (
          // Archived jobs view
          archivedJobs.length === 0 ? (
            <div className="text-center text-gray-500">No archived jobs yet.</div>
          ) : (
            <ul className="space-y-6">
              {archivedJobs.map((job, idx) => (
                <li key={job.jobid ?? `${job.job_title}-${job.company_name}-${idx}`} className="bg-white rounded-xl shadow p-6 flex flex-col md:flex-row md:items-center md:justify-between opacity-75">
                  <div>
                    <div className="font-bold text-lg text-gray-700">{job.job_title}</div>
                    <div className="text-gray-600">{job.company_name} &middot; {job.location}</div>
                    {job.salary_formatted && (
                      <div className="text-green-700 font-semibold mt-1">💰 {job.salary_formatted}</div>
                    )}
                    {job.company_rating !== undefined && (
                      <div className="text-yellow-600 font-semibold mt-1">⭐ {job.company_rating.toFixed(1)}</div>
                    )}
                  </div>
                  <div className="mt-4 md:mt-0 flex gap-2">
                    <button
                      className="bg-gray-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-gray-700 transition"
                      onClick={() => handleUnarchive(job)}
                    >
                      Unarchive
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )
        ) : (
          // Active jobs view
          jobs.length === 0 ? (
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
                    <button
                      className="bg-gray-500 text-white px-4 py-2 rounded-lg font-semibold hover:bg-gray-600 transition"
                      onClick={() => handleArchive(job)}
                      title="Archive this job"
                    >
                      Archive
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )
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
