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

export default function ApplyPage() {
  const [jobs, setJobs] = useState<AppliedJob[]>([]);

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
                <button
                  className="mt-4 md:mt-0 bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-700 transition"
                  onClick={() => handleApply(job.jobid)}
                >
                  Apply
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
