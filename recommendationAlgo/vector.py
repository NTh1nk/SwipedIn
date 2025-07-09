import os
from supabase import create_client
from transformers import AutoTokenizer, AutoModel
import torch
import time
from dotenv import load_dotenv
load_dotenv()

print("[INFO] Loading tokenizer and model...")
start_model_load = time.time()
tokenizer = AutoTokenizer.from_pretrained("sentence-transformers/all-MiniLM-L6-v2")
model = AutoModel.from_pretrained("sentence-transformers/all-MiniLM-L6-v2")
end_model_load = time.time()
print(f"[INFO] Model and tokenizer loaded in {end_model_load - start_model_load:.3f} seconds.")

print("[INFO] Setting device...")
device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
model.to(device)
print(f"[INFO] Using device: {device}")

# Hardcoded job description
job_description = "We're hiring a frontend engineer with experience in React and TypeScript to build modern web interfaces."

print("[INFO] Loading jobs from Supabase...")
start_jobs_load = time.time()
print("[DEBUG] SUPABASE_URL:", os.getenv("SUPABASE_URL"))
print("[DEBUG] SUPABASE_KEY:", os.getenv("SUPABASE_ANON_KEY"))
supabase = create_client(
    os.getenv("SUPABASE_URL"),
    os.getenv("SUPABASE_ANON_KEY")
)

job_list = supabase.table("jobs_duplicate").select("*").limit(1000).execute().data
end_jobs_load = time.time()
print(f"[INFO] Loaded {len(job_list)} jobs from Supabase in {end_jobs_load - start_jobs_load:.3f} seconds.")


@torch.no_grad()
def get_embedding(text):
    print(f"[INFO] Vectorizing text: {str(text)[:60]}...")
    start_time = time.time()
    encoded_input = tokenizer(text, padding=True, truncation=True, return_tensors='pt').to(device)
    model_output = model(**encoded_input)
    # Mean pooling
    embeddings = model_output.last_hidden_state.mean(dim=1)
    vector = embeddings.squeeze().cpu().tolist()
    end_time = time.time()
    print(f"[INFO] Vectorization time: {end_time - start_time:.3f} seconds")
    return vector

# Run the test
print("[INFO] Starting embedding generation for jobs...")
start_total = time.time()
for idx, job in enumerate(job_list):
    print(f"[INFO] Processing job {idx+1}/{len(job_list)}")
    print("[DEBUG] job object:", job['job_title'])
    if 'description_text' in job:
        embedding = get_embedding(job['description_text'])
        # Save the vector back to the job_duplicate table
        supabase.table("jobs_duplicate").update({"vector": embedding}).eq("jobid", job["jobid"]).execute()
        print(f"[INFO] Saved vector for job id {job['jobid']}")
    else:
        print("[WARNING] No 'description' field in job object, skipping.")
        continue
    print("[INFO] Vector length:", len(embedding))
    print("[INFO] First 5 values:", embedding[:5])  # Only print first few for brevity
end_total = time.time()
print(f"[INFO] All jobs processed in {end_total - start_total:.3f} seconds.")
