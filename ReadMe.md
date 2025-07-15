# Job Selector App

This project is a full-stack application for AI-powered job matching, featuring fast vector embedding, real-time recommendations, and Supabase integration.

## Project Structure

```
job-selecter-app/
├── recommendationAlgo/      # Python backend for embeddings & job matching
│   ├── algo.py
│   ├── algo_with_supabase.py
│   ├── vector.py
│   ├── test_supabase_connection.py
│   └── requirements.txt
├── swiped-in/               # Next.js frontend & API routes
│   ├── src/
│   │   └── app/
│   │       └── vector/      # Embedding & job matching UI/hooks
│   │           ├── page.tsx
│   │           ├── useEmbeddings.ts
│   │           └── layout.tsx
│   ├── supabase/            # Supabase config for local dev
│   └── public/
└── supabase/                # Supabase project files
```

## Features

- **AI Embedding Generation:** Uses OpenAI or fallback hash-based embeddings.
- **Vector Similarity Search:** Cosine similarity for resume/job matching.
- **Real-time Recommendations:** Instant job suggestions as users type.
- **Supabase Integration:** Stores and retrieves jobs and user data.
- **Caching & Performance:** Model and embedding caching, batch processing, and request deduplication.

## Usage

1. **Frontend:**  
   Run the Next.js app in `swiped-in/` for the user interface and API endpoints.
2. **Backend:**  
   Use the Python scripts in `recommendationAlgo/` for advanced embedding and matching logic.
3. **Supabase:**  
   Configure your Supabase project and update environment variables as needed.

## Development

- Install dependencies in both `swiped-in/` and `recommendationAlgo/`.
- Set up `.env` files for API keys and Supabase credentials.
- See [swiped-in/src/app/vector/README.md](swiped-in/src/app/vector/README.md) for details on embedding and job matching.

## Troubleshooting

- Ensure all API keys and Supabase URLs are set.
- Check logs for embedding/API errors.
- See [swiped-in/src/app/vector/README.md](swiped-in/src/app/vector/README.md) for more help.

---

For more details, see the individual README files in each subdirectory.