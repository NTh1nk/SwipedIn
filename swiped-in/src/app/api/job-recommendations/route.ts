import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://127.0.0.1:54321';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'your-anon-key';
const supabase = createClient(supabaseUrl, supabaseKey);

export async function POST(req: NextRequest) {
  try {
    const { resume } = await req.json();

    if (!resume || typeof resume !== 'string') {
      return NextResponse.json(
        { error: 'Resume text is required' },
        { status: 400 }
      );
    }

    const recommendations = await getJobRecommendations(resume);

    return NextResponse.json({ recommendations });
  } catch (error) {
    console.error('Error getting job recommendations:', error);
    return NextResponse.json(
      { error: 'Failed to get job recommendations' },
      { status: 500 }
    );
  }
}

async function loadJobsFromSupabase() {
  try {
    // Try different possible table names
    const tableNames = ['jobs', 'job_listings', 'job_posts', 'definitiondata'];
    
    for (const tableName of tableNames) {
      try {
        const { data, error } = await supabase
          .from(tableName)
          .select('*')
          .limit(50);
        
        if (error) {
          continue;
        }
        
        if (data && data.length > 0) {
          return data;
        }
      } catch (e) {
        continue;
      }
    }
    return [];
  } catch (error) {
    return [];
  }
}

function createJobDescriptions(jobs: any[]) {
  const descriptions = [];
  for (const job of jobs) {
    // Handle different possible column names
    const title = job.job_title || job.title || job.position || 'Unknown Position';
    const company = job.company_name || job.company || 'Unknown Company';
    const location = job.location || job.job_location || 'Unknown Location';
    const description = job.description || job.description_text || job.job_description || '';
    
    // Combine title, company, location, and description
    const descriptionText = `${title} at ${company} in ${location}. ${description}`;
    descriptions.push(descriptionText);
  }
  return descriptions;
}

function simpleKeywordMatching(resumeText: string, jobs: any[], topK: number = 10) {
  const resumeLower = resumeText.toLowerCase();
  const jobDescriptions = createJobDescriptions(jobs);
  
  // Expanded keyword list with more job-related terms
  const keywords = [
    // Technical skills
    'python', 'javascript', 'react', 'node', 'java', 'c++', 'c#', 'php', 'ruby', 'go', 'rust',
    'html', 'css', 'sql', 'mongodb', 'postgresql', 'mysql', 'redis', 'docker', 'kubernetes',
    'aws', 'azure', 'gcp', 'cloud', 'devops', 'ci/cd', 'git', 'github', 'agile', 'scrum',
    
    // Job roles and industries
    'developer', 'engineer', 'programmer', 'coder', 'architect', 'analyst', 'scientist',
    'manager', 'lead', 'senior', 'junior', 'full stack', 'frontend', 'backend', 'mobile',
    'web', 'software', 'hardware', 'system', 'network', 'security', 'database', 'data',
    'machine learning', 'ai', 'artificial intelligence', 'nlp', 'computer vision', 'deep learning',
    'designer', 'ui', 'ux', 'user interface', 'user experience', 'product', 'project',
    'business', 'marketing', 'sales', 'customer', 'support', 'operations', 'finance',
    'hr', 'human resources', 'legal', 'medical', 'healthcare', 'education', 'research',
    
    // General work terms
    'experience', 'years', 'team', 'collaboration', 'communication', 'leadership',
    'problem solving', 'analysis', 'planning', 'organization', 'management',
    'remote', 'onsite', 'hybrid', 'full time', 'part time', 'contract', 'freelance',
    
    // Education and certifications
    'degree', 'bachelor', 'master', 'phd', 'certification', 'certified', 'training',
    'course', 'workshop', 'seminar', 'conference', 'meetup'
  ];
  
  const scores = [];
  for (let i = 0; i < jobs.length; i++) {
    const jobDesc = jobDescriptions[i];
    const jobLower = jobDesc.toLowerCase();
    
    // Calculate keyword matches
    let score = 0;
    const matchedKeywords = [];
    
    for (const keyword of keywords) {
      if (resumeLower.includes(keyword) && jobLower.includes(keyword)) {
        score += 1;
        matchedKeywords.push(keyword);
      }
    }
    
    // Add bonus for exact phrase matches
    if (['garbage', 'collector', 'waste', 'recycling'].some(word => resumeLower.includes(word))) {
      if (['environmental', 'waste', 'recycling', 'sustainability', 'operations', 'maintenance'].some(word => jobLower.includes(word))) {
        score += 2; // Bonus for environmental/recycling related jobs
      }
    }
    
    // Add bonus for general work experience terms
    const generalTerms = ['experience', 'work', 'job', 'position', 'role', 'responsibility'];
    for (const term of generalTerms) {
      if (resumeLower.includes(term) && jobLower.includes(term)) {
        score += 0.5;
      }
    }
    
    scores.push({ score, index: i, matchedKeywords });
  }
  
  // Sort by score (descending)
  scores.sort((a, b) => b.score - a.score);
  
  const recommendations = [];
  for (let rank = 0; rank < Math.min(topK, scores.length); rank++) {
    const { score, index, matchedKeywords } = scores[rank];
    const job = jobs[index];
    const normalizedScore = Math.min(score / 10, 1.0); // Normalize to 0-1 range
    
    recommendations.push({
      job,
      similarity_score: normalizedScore,
      rank: rank + 1,
      matched_keywords: matchedKeywords
    });
  }
  
  return recommendations;
}

async function getJobRecommendations(resumeText: string) {
  const jobs = await loadJobsFromSupabase();
  if (jobs.length === 0) {
    return [];
  }
  // Use simple keyword matching for now
  const recommendations = simpleKeywordMatching(resumeText, jobs, 10);
  return recommendations;
} 