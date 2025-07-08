import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://127.0.0.1:54321';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'your-anon-key';
const supabase = createClient(supabaseUrl, supabaseKey);

// List of allowed keywords for matching and extraction
const ALLOWED_KEYWORDS = [
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

export async function POST(req: NextRequest) {
  try {
    const { resume } = await req.json();

    if (!resume || typeof resume !== 'string') {
      return NextResponse.json(
        { error: 'Resume text is required' },
        { status: 400 }
      );
    }

    // 1. Summarize resume into keywords using ai.hackclub.com, providing allowed keywords
    const keywords = await extractKeywordsWithLLM(resume, ALLOWED_KEYWORDS);
    console.log(keywords);
    if (!keywords) {
      return NextResponse.json(
        { error: 'Failed to extract keywords from resume' },
        { status: 500 }
      );
    }

    // 2. Use the keywords string for matching
    const recommendations = await getJobRecommendations(keywords);

    return NextResponse.json({ recommendations, keywords });
  } catch (error) {
    console.error('Error getting job recommendations:', error);
    return NextResponse.json(
      { error: 'Failed to get job recommendations' },
      { status: 500 }
    );
  }
}

// Update extractKeywordsWithLLM to accept allowedKeywords
async function extractKeywordsWithLLM(resume: string, allowedKeywords: string[]): Promise<string | null> {
  try {
    const allowedKeywordsStr = allowedKeywords.join(', ');
    const prompt = `Extract the most relevant keywords from this resume, separated by commas. Only output the keywords, nothing else. You must only use keywords from the following list:\n${allowedKeywordsStr}\n\nResume:\n${resume}`;
    const response = await fetch('https://ai.hackclub.com/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messages: [
          { role: 'user', content: prompt },
        ],
        stream: false
      }),
    });
    if (!response.ok) {
      console.error('ai.hackclub.com LLM error:', await response.text());
      return null;
    }
    const data = await response.json();
    // The response is in data.choices[0].message.content
    const content = data.choices?.[0]?.message?.content;
    if (!content) return null;
    // Clean up: remove any extra text, just get the keywords string
    console.log( "this is the content" + content);

    return content.replace(/\n/g, '').replace(/^Keywords: */i, '').trim();
  } catch (error) {
    console.error('Error calling ai.hackclub.com:', error);
    return null;
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

// Update simpleKeywordMatching to use ALLOWED_KEYWORDS
function simpleKeywordMatching(resumeText: string, jobs: any[], topK: number = 10) {
  const resumeLower = resumeText.toLowerCase();
  const jobDescriptions = createJobDescriptions(jobs);
  
  // Use the shared allowed keywords
  const keywords = ALLOWED_KEYWORDS;
  
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

async function getJobRecommendations(keywords: string) {
  const jobs = await loadJobsFromSupabase();
  if (jobs.length === 0) {
    return [];
  }
  // Use the keywords string for matching
  const recommendations = simpleKeywordMatching(keywords, jobs, 10);
  return recommendations;
} 