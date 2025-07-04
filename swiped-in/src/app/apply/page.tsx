"use client";

import { useRef, useState } from "react";

export default function ProfilePage() {
  const [resume, setResume] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setResume(e.target.files[0]);
    }
  };  

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white text-black p-4">
      <h1 className="text-2xl font-bold mb-6">Apply</h1>
      <div className="w-full max-w-md bg-gray-100 rounded-xl shadow p-6 flex flex-col items-center">
        <label className="block mb-2 font-medium">Upload your resume (PDF or DOCX):</label>
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,.doc,.docx"
          onChange={handleFileChange}
          className="mb-4 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
        />
        {resume && (
          <div className="mt-2 text-green-700">
            <span className="font-semibold">Selected file:</span> {resume.name}
          </div>
        )}
      </div>
    </div>
  );
}
