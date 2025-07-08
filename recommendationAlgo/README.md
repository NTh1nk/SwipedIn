# Job Recommendation Algorithm

This directory contains a job recommendation system that uses sentence transformers to match resumes with job postings from the Supabase `Job_duplicate` table.

## Setup

1. **Install Python dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

2. **Set up environment variables:**
   ```bash
   export SUPABASE_URL='your-supabase-url'
   export SUPABASE_ANON_KEY='your-anon-key'
   ```

   Or create a `.env` file:
   ```
   SUPABASE_URL=your-supabase-url
   SUPABASE_ANON_KEY=your-anon-key
   ```

## Usage

### Test Connection
First, test your Supabase connection:
```bash
python test_supabase_connection.py
```

### Run Job Recommendations
```bash
python algo_with_supabase.py
```

This will:
1. Load jobs from the `Job_duplicate` table in Supabase
2. Use a sentence transformer model to create embeddings
3. Compare a sample resume with job descriptions
4. Return the top 5 most similar jobs

### Custom Resume Analysis
You can modify the `resume_text` variable in `algo_with_supabase.py` to analyze different resumes:

```python
resume_text = "Your resume text here..."
```

## Files

- `algo_with_supabase.py` - Main job recommendation script
- `test_supabase_connection.py` - Test Supabase connection
- `requirements.txt` - Python dependencies
- `algo.py` - Original algorithm (for reference)

## How it Works

1. **Job Loading**: Jobs are loaded from the `Job_duplicate` table in Supabase
2. **Text Processing**: Job titles, companies, locations, and descriptions are combined into searchable text
3. **Embedding Generation**: Both resume and job descriptions are converted to vector embeddings using the `all-MiniLM-L6-v2` model
4. **Similarity Calculation**: Cosine similarity is used to find the most similar jobs
5. **Ranking**: Jobs are ranked by similarity score and returned as recommendations

## Expected Job Table Structure

The `Job_duplicate` table should have these columns:
- `id` - Unique identifier
- `title` - Job title
- `company` - Company name
- `location` - Job location
- `description` - Job description

## Performance

- The first run will download the sentence transformer model (~90MB)
- Subsequent runs will be faster as the model is cached
- You can save embeddings to disk for even faster future runs 