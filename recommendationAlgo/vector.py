from transformers import AutoTokenizer, AutoModel
import torch
import time

# Load model and tokenizer
tokenizer = AutoTokenizer.from_pretrained("sentence-transformers/all-MiniLM-L6-v2")
model = AutoModel.from_pretrained("sentence-transformers/all-MiniLM-L6-v2")

device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
model.to(device)

# Hardcoded job description
job_description = "We're hiring a frontend engineer with experience in React and TypeScript to build modern web interfaces."

@torch.no_grad()
def get_embedding(text):
    start_time = time.time()
    encoded_input = tokenizer(text, padding=True, truncation=True, return_tensors='pt').to(device)
    model_output = model(**encoded_input)
    # Mean pooling
    embeddings = model_output.last_hidden_state.mean(dim=1)
    vector = embeddings.squeeze().cpu().tolist()
    end_time = time.time()
    print(f"Vectorization time: {end_time - start_time:.3f} seconds")
    return vector

# Run the test
embedding = get_embedding(job_description)
print("Vector length:", len(embedding))
print("First 5 values:", embedding[:5])  # Only print first few for brevity
