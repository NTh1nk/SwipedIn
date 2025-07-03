"use client";

import { useEffect, useState } from "react";

// Define the job type
interface Job {
  id: number;
  title: string;
  company: string;
  location: string;
  description: string;
}

export default function JobListPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/jobs.json")
      .then((res) => {
        if (!res.ok) throw new Error("Failed to load jobs");
        return res.json();
      })
      .then((data) => {
        setJobs(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  if (loading) return <div>Loading jobs...</div>;
  if (error) return <div className="text-red-600">Error: {error}</div>;

  return (
    <div className="min-h-screen bg-white text-black p-6">
      <h1 className="text-2xl font-bold mb-6">Job Listings</h1>
      <div className="grid gap-4 max-w-2xl mx-auto">
        {jobs.map((job) => (
          <div key={job.id} className="bg-blue-50 rounded-xl shadow p-4">
            <h2 className="text-xl font-semibold">{job.title}</h2>
            <div className="text-blue-800 font-medium">{job.company}</div>
            <div className="text-sm text-gray-600 mb-2">{job.location}</div>
            <p className="text-gray-800">{job.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
