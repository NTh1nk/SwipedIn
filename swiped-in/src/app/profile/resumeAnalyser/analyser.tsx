import { useState } from "react";

const [resumeText, setResumeText] = useState('');
const [summary, setSummary] = useState('');
const [loading, setLoading] = useState(false);

const handleSummarize = async () => {
  setLoading(true);
  const res = await fetch('/api/summarize-resume', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ resume: resumeText }),
  });
  const data = await res.json();
  setSummary(data.summary);
  setLoading(false);
};