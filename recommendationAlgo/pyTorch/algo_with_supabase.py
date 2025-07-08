import os
import asyncio
from sentence_transformers import SentenceTransformer, util
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

# Initialize the sentence transformer model
model = SentenceTransformer('all-MiniLM-L6-v2')

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

def get_job_recommendations(resume_text: str, jobs: List[Dict[str, Any]], top_k: int = 5) -> List[Dict[str, Any]]:
    """
    Get job recommendations based on resume text
    """
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
    resume_text = "Machine learning engineer with 3 years of experience in Python, PyTorch, and natural language processing. Skilled in building and deploying ML models, working with large datasets, and collaborating with cross-functional teams."
    
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
        print(f"   Description: {description[:100]}...")

if __name__ == "__main__":
    main() 