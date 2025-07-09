import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://127.0.0.1:54321';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'your-anon-key';
const supabase = createClient(supabaseUrl, supabaseKey);

// Cosine similarity function
function cosineSimilarity(vecA: number[], vecB: number[]): number {
  if (vecA.length !== vecB.length) {
    throw new Error('Vectors must have the same length');
  }
  
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;
  
  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i];
    normA += vecA[i] * vecA[i];
    normB += vecB[i] * vecB[i];
  }
  
  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

// Load jobs from Supabase
async function loadJobsFromSupabase() {
  try {
    // Try different possible table names
    const tableNames = ['jobs', 'job_listings', 'job_posts', 'definitiondata', 'jobs_duplicate'];
    
    for (const tableName of tableNames) {
      try {
        const { data, error } = await supabase
          .from(tableName)
          .select('*')
          .limit(1000);
        
        if (error) {
          console.log(`[DEBUG] Error with table ${tableName}:`, error.message);
          continue;
        }
        
        if (data && data.length > 0) {
          console.log(`[INFO] Loaded ${data.length} jobs from table: ${tableName}`);
          return data;
        }
      } catch (e) {
        console.log(`[DEBUG] Exception with table ${tableName}:`, e);
        continue;
      }
    }
    
    console.log('[WARNING] No jobs found in any table');
    return [];
  } catch (error) {
    console.error('[ERROR] Failed to load jobs:', error);
    return [];
  }
}

// Find similar jobs using vector similarity
async function findSimilarJobs(resumeEmbedding: number[], topK: number = 10) {
  try {
    const jobs = await loadJobsFromSupabase();
    
    if (jobs.length === 0) {
      return [];
    }
    
    const jobScores = [];
    
    for (const job of jobs) {
      let jobEmbedding: number[] | null = null;
      
      // Try to get pre-computed embedding
      if (job.vector && Array.isArray(job.vector)) {
        jobEmbedding = job.vector;
      } else if (job.embedding && Array.isArray(job.embedding)) {
        jobEmbedding = job.embedding;
      }
      
      // If no pre-computed embedding, generate one from job description
      if (!jobEmbedding) {
        const jobText = createJobDescription(job);
        jobEmbedding = generateFallbackEmbedding(jobText);
      }
      
      // Calculate similarity
      const similarity = cosineSimilarity(resumeEmbedding, jobEmbedding);
      
      jobScores.push({
        job,
        score: similarity,
        title: job.job_title || job.title || job.position || 'Unknown Position',
        company: job.company_name || job.company || 'Unknown Company',
        location: job.location || job.job_location || 'Unknown Location',
        description: job.description || job.description_text || job.job_description || ''
      });
    }
    
    // Sort by similarity score (descending)
    jobScores.sort((a, b) => b.score - a.score);
    
    // Return top K matches
    return jobScores.slice(0, topK);
    
  } catch (error) {
    console.error('[ERROR] Failed to find similar jobs:', error);
    return [];
  }
}

// Create job description from job data
function createJobDescription(job: any): string {
  const title = job.job_title || job.title || job.position || 'Unknown Position';
  const company = job.company_name || job.company || 'Unknown Company';
  const location = job.location || job.job_location || 'Unknown Location';
  const description = job.description || job.description_text || job.job_description || '';
  
  return `${title} at ${company} in ${location}. ${description}`;
}

// Fallback embedding generation (same as in embedding route)
function generateFallbackEmbedding(text: string): number[] {
  const words = text.toLowerCase().split(/\s+/);
  const embedding = new Array(384).fill(0);
  
  words.forEach((word, index) => {
    const hash = word.split('').reduce((a, b) => {
      a = ((a << 5) - a) + b.charCodeAt(0);
      return a & a;
    }, 0);
    
    const position = Math.abs(hash) % embedding.length;
    embedding[position] = (hash % 100) / 100;
  });
  
  return embedding;
}

export async function POST(req: NextRequest) {
  try {
    const { embedding } = await req.json();
    
    if (!embedding || !Array.isArray(embedding)) {
      return NextResponse.json(
        { error: 'Valid embedding array is required' },
        { status: 400 }
      );
    }

    console.log(`[INFO] Finding similar jobs for embedding of length: ${embedding.length}`);
    
    const similarJobs = await findSimilarJobs(embedding, 10);
    
    return NextResponse.json({ 
      matches: similarJobs,
      total_found: similarJobs.length
    });
    
  } catch (error) {
    console.error('[ERROR] Job matching failed:', error);
    return NextResponse.json(
      { error: 'Failed to find similar jobs' },
      { status: 500 }
    );
  }
}

// Health check endpoint
export async function GET() {
  try {
    const jobs = await loadJobsFromSupabase();
    return NextResponse.json({ 
      jobs_available: jobs.length,
      tables_checked: ['jobs', 'job_listings', 'job_posts', 'definitiondata', 'jobs_duplicate']
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to check job availability' },
      { status: 500 }
    );
  }
} 