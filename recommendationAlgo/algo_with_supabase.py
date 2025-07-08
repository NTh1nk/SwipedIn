import os
import asyncio
import torch
import pickle
from supabase import create_client, Client
from typing import List, Dict, Any
import json
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# Initialize Supabase client
supabase_url = os.getenv('SUPABASE_URL', 'http://127.0.0.1:54321')
supabase_key = os.getenv('SUPABASE_ANON_KEY', 'your-anon-key')
supabase: Client = create_client(supabase_url, supabase_key)

# Initialize the sentence transformer model with error handling
def initialize_model():
    try:
        from sentence_transformers import SentenceTransformer, util
        print("Downloading sentence transformer model...")
        model = SentenceTransformer('all-MiniLM-L6-v2')
        print("✅ Model loaded successfully!")
        return model, util
    except Exception as e:
        print(f"❌ Error loading sentence transformer model: {e}")
        print("Falling back to simple keyword matching...")
        return None, None

model, util = initialize_model()

def load_jobs_from_supabase() -> List[Dict[str, Any]]:
    """
    Load jobs from the existing job table in Supabase
    """
    try:
        # Query the job table - adjust table name based on what you see in Supabase
        # Try different possible table names
        table_names = ['jobs', 'job_listings', 'job_posts', 'definitiondata']
        
        for table_name in table_names:
            try:
                print(f"Trying to load from table: {table_name}")
                response = supabase.table(table_name).select('*').limit(20).execute()
                
                if response.data:
                    print(f"✅ Successfully loaded {len(response.data)} jobs from {table_name} table")
                    return response.data
            except Exception as e:
                print(f"❌ Table {table_name} not found: {e}")
                continue
        
        print("❌ No job table found. Please check your Supabase dashboard for the correct table name.")
        return []
            
    except Exception as e:
        print(f"Error loading jobs from Supabase: {e}")
        return []

def create_job_descriptions(jobs: List[Dict[str, Any]]) -> List[str]:
    """
    Create job descriptions from job data for embedding
    """
    descriptions = []
    for job in jobs:
        # Handle different possible column names
        title = job.get('job_title') or job.get('title') or job.get('position') or 'Unknown Position'
        company = job.get('company_name') or job.get('company') or 'Unknown Company'
        location = job.get('location') or job.get('job_location') or 'Unknown Location'
        description = job.get('description') or job.get('description_text') or job.get('job_description') or ''
        
        # Combine title, company, location, and description
        description_text = f"{title} at {company} in {location}. {description}"
        descriptions.append(description_text)
    return descriptions

def simple_keyword_matching(resume_text: str, jobs: List[Dict[str, Any]], top_k: int = 5) -> List[Dict[str, Any]]:
    """
    Simple keyword-based matching as fallback when sentence transformers fail
    """
    resume_lower = resume_text.lower()
    job_descriptions = create_job_descriptions(jobs)
    
    # Expanded keyword list with more job-related terms
    keywords = [
        # Technical skills
        'python', 'javascript', 'react', 'node', 'java', 'c++', 'c#', 'php', 'ruby', 'go', 'rust',
        'html', 'css', 'sql', 'mongodb', 'postgresql', 'mysql', 'redis', 'docker', 'kubernetes',
        'aws', 'azure', 'gcp', 'cloud', 'devops', 'ci/cd', 'git', 'github', 'agile', 'scrum',
        
        # Job roles and industries
        'developer', 'engineer', 'programmer', 'coder', 'architect', 'analyst', 'scientist',
        'manager', 'lead', 'senior', 'junior', 'full stack', 'frontend', 'backend', 'mobile',
        'web', 'software', 'hardware', 'system', 'network', 'security', 'database', 'data',
        'machine learning', 'ai', 'artificial intelligence', 'nlp', 'computer vision', 'deep learning',
        'designer', 'ui', 'ux', 'user interface', 'user experience', 'product', 'project',
        'business', 'marketing', 'sales', 'customer', 'support', 'operations', 'finance',
        'hr', 'human resources', 'legal', 'medical', 'healthcare', 'education', 'research',
        
        # General work terms
        'experience', 'years', 'team', 'collaboration', 'communication', 'leadership',
        'problem solving', 'analysis', 'planning', 'organization', 'management',
        'remote', 'onsite', 'hybrid', 'full time', 'part time', 'contract', 'freelance',
        
        # Education and certifications
        'degree', 'bachelor', 'master', 'phd', 'certification', 'certified', 'training',
        'course', 'workshop', 'seminar', 'conference', 'meetup'
    ]
    
    scores = []
    for i, job_desc in enumerate(job_descriptions):
        job_lower = job_desc.lower()
        
        # Calculate keyword matches
        score = 0
        matched_keywords = []
        
        for keyword in keywords:
            if keyword in resume_lower and keyword in job_lower:
                score += 1
                matched_keywords.append(keyword)
        
        # Add bonus for exact phrase matches
        if any(word in resume_lower for word in ['garbage', 'collector', 'waste', 'recycling']):
            if any(word in job_lower for word in ['environmental', 'waste', 'recycling', 'sustainability', 'operations', 'maintenance']):
                score += 2  # Bonus for environmental/recycling related jobs
        
        # Add bonus for general work experience terms
        general_terms = ['experience', 'work', 'job', 'position', 'role', 'responsibility']
        for term in general_terms:
            if term in resume_lower and term in job_lower:
                score += 0.5
        
        scores.append((score, i, matched_keywords))
    
    # Sort by score (descending)
    scores.sort(reverse=True)
    
    recommendations = []
    for rank, (score, idx, matched_keywords) in enumerate(scores[:top_k]):
        job = jobs[idx]
        normalized_score = min(score / 10, 1.0)  # Normalize to 0-1 range
        
        recommendations.append({
            'job': job,
            'similarity_score': normalized_score,
            'rank': rank + 1,
            'matched_keywords': matched_keywords
        })
    
    return recommendations

def get_job_recommendations(resume_text: str, jobs: List[Dict[str, Any]], top_k: int = 5) -> List[Dict[str, Any]]:
    """
    Get job recommendations based on resume text
    """
    if model is None or util is None:
        print("Using simple keyword matching...")
        return simple_keyword_matching(resume_text, jobs, top_k)
    
    # Use sentence transformers
    try:
        # Create job descriptions
        job_descriptions = create_job_descriptions(jobs)
        
        # Encode resume and job descriptions
        resume_embedding = model.encode(resume_text, convert_to_tensor=True)
        job_embeddings = model.encode(job_descriptions, convert_to_tensor=True)
        
        # Calculate similarity scores
        similarity_scores = util.cos_sim(resume_embedding, job_embeddings)[0]
        
        # Get top k recommendations
        top_indices = torch.topk(similarity_scores, k=min(top_k, len(jobs))).indices
        
        recommendations = []
        for idx in top_indices:
            job = jobs[idx]
            score = similarity_scores[idx].item()
            recommendations.append({
                'job': job,
                'similarity_score': score,
                'rank': len(recommendations) + 1
            })
        
        return recommendations
    except Exception as e:
        print(f"Error with sentence transformers: {e}")
        print("Falling back to keyword matching...")
        return simple_keyword_matching(resume_text, jobs, top_k)

def main():
    """
    Main function to demonstrate job recommendation
    """
    print("Loading jobs from Supabase...")
    jobs = load_jobs_from_supabase()
    
    if not jobs:
        print("No jobs available. Exiting.")
        return
    
    # Show sample job structure
    print(f"\nSample job structure:")
    if jobs:
        sample_job = jobs[0]
        for key, value in sample_job.items():
            print(f"  {key}: {str(value)[:50]}...")
    
    # Example resume text
    resume_text = "Garbage collector."
    
    print(f"\nAnalyzing resume: {resume_text[:100]}...")
    
    # Get recommendations
    recommendations = get_job_recommendations(resume_text, jobs, top_k=5)
    
    print(f"\nTop {len(recommendations)} job recommendations:")
    print("-" * 80)
    
    for rec in recommendations:
        job = rec['job']
        score = rec['similarity_score']
        rank = rec['rank']
        
        # Handle different possible column names
        title = job.get('job_title') or job.get('title') or 'N/A'
        company = job.get('company_name') or job.get('company') or 'N/A'
        location = job.get('location') or job.get('job_location') or 'N/A'
        description = job.get('description') or job.get('description_text') or job.get('job_description') or 'N/A'
        
        print(f"\n{rank}. {title} at {company}")
        print(f"   Location: {location}")
        print(f"   Similarity Score: {score:.4f}")
        if hasattr(rec, 'matched_keywords') and rec['matched_keywords']:
            print(f"   Matched Keywords: {', '.join(rec['matched_keywords'])}")
        print(f"   Description: {description[:100]}...")

if __name__ == "__main__":
    main() 