'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useEmbeddings } from './useEmbeddings';

export default function VectorPage() {
  const [resumeText, setResumeText] = useState('');
  const [embedding, setEmbedding] = useState<number[] | null>(null);
  const [jobMatches, setJobMatches] = useState<any[]>([]);
  const [isFindingJobs, setIsFindingJobs] = useState(false);
  const { generateEmbedding, isLoading, error, isModelLoaded } = useEmbeddings();

  const handleGenerateEmbedding = async () => {
    if (!resumeText.trim()) return;
    
    try {
      const result = await generateEmbedding(resumeText);
      setEmbedding(result);
    } catch (err) {
      console.error('Failed to generate embedding:', err);
    }
  };

  const handleFindJobs = async () => {
    if (!embedding) return;
    
    setIsFindingJobs(true);
    try {
      const matches = await getJobMatches(embedding);
      setJobMatches(matches);
    } catch (err) {
      console.error('Failed to find jobs:', err);
    } finally {
      setIsFindingJobs(false);
    }
  };

  const getJobMatches = async (embedding: number[]) => {
    try {
      const response = await fetch('/api/vector/job-matching', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ embedding }),
      });

      if (!response.ok) {
        throw new Error('Failed to get job matches');
      }

      const data = await response.json();
      return data.matches || [];
    } catch (error) {
      console.error('Error getting job matches:', error);
      return [];
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-2 text-black">Vector Embedding & Job Matching</h1>
        <p className="text-gray-600">Generate embeddings for your resume and find matching jobs</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Input Section */}
        <Card>
          <CardHeader>
            <CardTitle className='text-black' >Resume Input</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                Resume Text
              </label>
              <Textarea
                value={resumeText}
                onChange={(e) => setResumeText(e.target.value)}
                placeholder="Paste your resume text here..."
                rows={8}
                className="w-full bg-white text-black"
              />
            </div>
            
            <div className="flex gap-3">
              <Button 
                onClick={handleGenerateEmbedding}
                disabled={isLoading || !resumeText.trim()}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 transform hover:scale-105 hover:shadow-lg disabled:transform-none disabled:shadow-none disabled:opacity-50"
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Generating...
                  </div>
                ) : (
                  'Generate Embedding'
                )}
              </Button>
              
              <Button 
                onClick={handleFindJobs}
                disabled={isFindingJobs || !embedding}
                variant="outline"
                className="flex-1 border-2 border-green-600 text-green-600 hover:bg-green-600 hover:text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 transform hover:scale-105 hover:shadow-lg disabled:transform-none disabled:shadow-none disabled:opacity-50 disabled:border-gray-300 disabled:text-gray-300"
              >
                {isFindingJobs ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                    Finding Jobs...
                  </div>
                ) : (
                  'Find Jobs'
                )}
              </Button>
            </div>

            {error && (
              <div className="text-red-600 text-sm p-3 bg-red-50 rounded">
                Error: {error}
              </div>
            )}

            {isModelLoaded && (
              <div className="text-green-600 text-sm p-3 bg-green-50 rounded border border-green-200">
                ✓ Model is loaded and cached
              </div>
            )}

            {jobMatches.length > 0 && (
              <div className="text-blue-600 text-sm p-3 bg-blue-50 rounded border border-blue-200">
                ✓ Found {jobMatches.length} matching jobs
              </div>
            )}
          </CardContent>
        </Card>

        {/* Results Section */}
        <Card>
          <CardHeader>
            <CardTitle className='text-black' >Results</CardTitle>
          </CardHeader>
          <CardContent className=" text-black space-y-4">
            {embedding && (
              <div className="space-y-2">
                <h3 className="font-medium">Generated Embedding:</h3>
                <div className="bg-gray-100 p-3 rounded text-sm font-mono">
                  <div>Length: {embedding.length} dimensions</div>
                  <div>First 5 values: [{embedding.slice(0, 5).map(v => v.toFixed(4)).join(', ')}]</div>
                  <div>Last 5 values: [{embedding.slice(-5).map(v => v.toFixed(4)).join(', ')}]</div>
                </div>
              </div>
            )}

            {jobMatches.length > 0 && (
              <div className="space-y-2">
                <h3 className="font-medium text-black">Top Job Matches:</h3>
                <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
                  {jobMatches.map((job, index) => (
                    <div 
                      key={index} 
                      className="p-4 border border-gray-200 rounded-lg bg-white hover:border-blue-300 hover:shadow-md transition-all duration-200 transform hover:scale-[1.02] cursor-pointer group"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div className="font-semibold text-black group-hover:text-blue-600 transition-colors">
                          {job.title || 'Unknown Position'}
                        </div>
                        <div className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium">
                          {(job.score * 100).toFixed(1)}% match
                        </div>
                      </div>
                      <div className="text-sm text-gray-600 mb-1">
                        {job.company || 'Unknown Company'}
                      </div>
                      <div className="text-sm text-gray-500">
                        {job.location || 'Unknown Location'}
                      </div>
                      {job.description && (
                        <div className="text-xs text-gray-400 mt-2 line-clamp-2">
                          {job.description.substring(0, 100)}...
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 