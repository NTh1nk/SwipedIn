import os
import asyncio
from sentence_transformers import SentenceTransformer, util
import torch
import pickle
from supabase import create_client, Client
from typing import List, Dict, Any
import json

# Initialize Supabase client
supabase_url = os.getenv('SUPABASE_URL', 'http://127.0.0.1:54321')
supabase_key = os.getenv('SUPABASE_ANON_KEY', 'your-anon-key')
supabase: Client = create_client(supabase_url, supabase_key)

# Initialize the sentence transformer model
model = SentenceTransformer('all-MiniLM-L6-v2')

def load_jobs_from_supabase() -> List[Dict[str, Any]]:
    """
    Load jobs from the Job_duplicate table in Supabase
    """
    try:
        # Query the Job_duplicate table
        response = supabase.table('Job_duplicate').select('*').execute()
        
        if response.data:
            print(f"Loaded {len(response.data)} jobs from Job_duplicate table")
            return response.data
        else:
            print("No jobs found in Job_duplicate table")
            return []
            
    except Exception as e:
        print(f"Error loading jobs from Supabase: {e}")
        # Fallback to sample data if table doesn't exist
        return create_sample_jobs()

def create_sample_jobs() -> List[Dict[str, Any]]:
    """
    Create sample job data if the job_duplicate table doesn't exist
    """
    sample_jobs = [
        {
            "id": 1,
            "title": "Frontend Developer",
            "company": "Tech Solutions",
            "location": "Remote",
            "description": "Work on modern web apps using React and TypeScript. Experience with Next.js, Tailwind CSS, and modern JavaScript frameworks required."
        },
        {
            "id": 2,
            "title": "Backend Engineer",
            "company": "Cloudify",
            "location": "Berlin, Germany",
            "description": "Build scalable APIs and microservices with Node.js, Python, and cloud technologies. Experience with AWS, Docker, and Kubernetes preferred."
        },
        {
            "id": 3,
            "title": "UI/UX Designer",
            "company": "DesignHub",
            "location": "New York, NY",
            "description": "Create beautiful and user-friendly interfaces for web and mobile. Proficiency in Figma, Adobe Creative Suite, and design systems required."
        },
        {
            "id": 4,
            "title": "Machine Learning Engineer",
            "company": "AI Innovations",
            "location": "San Francisco, CA",
            "description": "Develop and deploy machine learning models using Python, PyTorch, and TensorFlow. Experience with NLP, computer vision, and MLOps preferred."
        },
        {
            "id": 5,
            "title": "Data Scientist",
            "company": "DataCorp",
            "location": "London, UK",
            "description": "Analyze complex datasets and build predictive models using Python, R, and SQL. Experience with statistical analysis and data visualization required."
        }
    ]
    
    # Insert sample jobs into Job_duplicate table
    try:
        for job in sample_jobs:
            supabase.table('Job_duplicate').insert(job).execute()
        print(f"Inserted {len(sample_jobs)} sample jobs into Job_duplicate table")
    except Exception as e:
        print(f"Could not insert sample jobs: {e}")
    
    return sample_jobs

def create_job_descriptions(jobs: List[Dict[str, Any]]) -> List[str]:
    """
    Create job descriptions from job data for embedding
    """
    descriptions = []
    for job in jobs:
        # Combine title, company, location, and description
        description = f"{job.get('title', '')} at {job.get('company', '')} in {job.get('location', '')}. {job.get('description', '')}"
        descriptions.append(description)
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

def save_embeddings(jobs: List[Dict[str, Any]], filename: str = "job_embeddings.pt"):
    """
    Save job embeddings for faster future use
    """
    job_descriptions = create_job_descriptions(jobs)
    job_embeddings = model.encode(job_descriptions, convert_to_tensor=True)
    
    # Save embeddings and job data
    torch.save(job_embeddings, filename)
    with open("job_data.pkl", "wb") as f:
        pickle.dump(jobs, f)
    
    print(f"Saved embeddings to {filename} and job data to job_data.pkl")

def load_embeddings(filename: str = "job_embeddings.pt") -> tuple:
    """
    Load saved embeddings and job data
    """
    try:
        job_embeddings = torch.load(filename)
        with open("job_data.pkl", "rb") as f:
            jobs = pickle.load(f)
        print(f"Loaded embeddings from {filename}")
        return job_embeddings, jobs
    except FileNotFoundError:
        print(f"Embeddings file {filename} not found. Please run save_embeddings first.")
        return None, None

def main():
    """
    Main function to demonstrate job recommendation
    """
    print("Loading jobs from Supabase...")
    jobs = load_jobs_from_supabase()
    
    if not jobs:
        print("No jobs available. Exiting.")
        return
    
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
        
        print(f"\n{rank}. {job.get('title', 'N/A')} at {job.get('company', 'N/A')}")
        print(f"   Location: {job.get('location', 'N/A')}")
        print(f"   Similarity Score: {score:.4f}")
        print(f"   Description: {job.get('description', 'N/A')[:100]}...")
    
    # Optionally save embeddings for faster future use
    save_choice = input("\nWould you like to save embeddings for faster future use? (y/n): ")
    if save_choice.lower() == 'y':
        save_embeddings()

if __name__ == "__main__":
    main() 