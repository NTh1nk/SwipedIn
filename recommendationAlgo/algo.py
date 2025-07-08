from sentence_transformers import SentenceTransformer
import torch
import pickle

model = SentenceTransformer('all-MiniLM-L6-v2')
jobs = [...]  # your list of 1000 job descriptions

# Convert to embeddings (batch)
job_embeddings = model.encode(jobs, convert_to_tensor=True)

# Save for later
torch.save(job_embeddings, "job_vectors.pt")
with open("job_texts.pkl", "wb") as f:
    pickle.dump(jobs, f)


# Load stored data
job_embeddings = torch.load("job_vectors.pt")
with open("job_texts.pkl", "rb") as f:
    jobs = pickle.load(f)

resume = "Machine learning engineer with NLP and PyTorch experience"
resume_emb = model.encode(resume, convert_to_tensor=True)

# Compare
from sentence_transformers import util
scores = util.cos_sim(resume_emb, job_embeddings)[0]
top = torch.topk(scores, k=10)

for score, idx in zip(top.values, top.indices):
    print(f"{score:.4f} → {jobs[idx]}")
