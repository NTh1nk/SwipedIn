# Vector Embedding & Job Matching

This folder contains the vector embedding functionality for fast job matching using AI-powered similarity search.

## Features

- **Fast Embedding Generation**: Uses external APIs (OpenAI/Hugging Face) for quick model loading
- **Vector Similarity Search**: Cosine similarity matching between resume and job embeddings
- **Real-time Job Matching**: Instant job recommendations based on resume content
- **Fallback Embedding**: Hash-based embedding generation when external APIs are unavailable
- **Caching System**: Model and embedding caching for improved performance

## File Structure

```
vector/
├── page.tsx              # Main vector embedding page
├── useEmbeddings.ts      # React hook for embedding generation
├── layout.tsx            # Layout component for vector section
└── README.md            # This file
```

## API Routes

```
/api/vector/
├── embedding/            # Generate embeddings from text
│   └── route.ts
└── job-matching/        # Find similar jobs using embeddings
    └── route.ts
```

## How It Works

### 1. Embedding Generation
- User inputs resume text
- Text is sent to `/api/vector/embedding`
- API generates vector embedding using:
  - **Primary**: OpenAI Embeddings API (fast, reliable)
  - **Fallback**: Hash-based embedding generation (demo purposes)

### 2. Job Matching
- Generated embedding is sent to `/api/vector/job-matching`
- API loads jobs from Supabase database
- Calculates cosine similarity between resume and job embeddings
- Returns top matching jobs sorted by similarity score

### 3. Performance Optimizations
- **Model Caching**: Prevents repeated model loading
- **Request Deduplication**: Avoids duplicate API calls
- **Batch Processing**: Handles multiple embeddings efficiently
- **Fallback Systems**: Ensures functionality even when external APIs fail

## Usage

### Basic Usage
```typescript
import { useEmbeddings } from './useEmbeddings';

function MyComponent() {
  const { generateEmbedding, isLoading, error } = useEmbeddings();
  
  const handleGenerate = async (text: string) => {
    const embedding = await generateEmbedding(text);
    console.log('Generated embedding:', embedding);
  };
}
```

### Job Matching
```typescript
const getJobMatches = async (embedding: number[]) => {
  const response = await fetch('/api/vector/job-matching', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ embedding }),
  });
  
  const data = await response.json();
  return data.matches;
};
```

## Environment Variables

Add these to your `.env.local`:

```bash
# OpenAI (for embeddings)
OPENAI_API_KEY=your_openai_api_key

# Supabase (for job data)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## Performance Benefits

### Fast Model Loading
- **External APIs**: No model loading overhead
- **Caching**: Embeddings cached for repeated requests
- **Edge Functions**: Can be deployed as Vercel Edge Functions for even faster response

### Scalability
- **Serverless**: Scales automatically with demand
- **Database Integration**: Works with existing Supabase job data
- **Fallback Systems**: Maintains functionality during API outages

## Future Enhancements

1. **Vector Database Integration**: Pinecone/Weaviate for better similarity search
2. **Pre-computed Embeddings**: Store job embeddings in database
3. **Advanced Filtering**: Location, salary, experience level filtering
4. **Real-time Updates**: Live job matching as user types
5. **Multi-modal Embeddings**: Support for images, documents, etc.

## Troubleshooting

### Common Issues

1. **API Key Missing**: Ensure `OPENAI_API_KEY` is set in environment variables
2. **Supabase Connection**: Check Supabase URL and key configuration
3. **Rate Limiting**: External APIs may have rate limits
4. **Cold Starts**: First request may be slower due to serverless cold start

### Debug Mode
Enable debug logging by checking browser console for detailed information about:
- Embedding generation time
- API response status
- Similarity calculation results
- Database connection status

## Contributing

When adding new features:
1. Maintain the caching system for performance
2. Add proper error handling and fallbacks
3. Update this README with new functionality
4. Test with both external APIs and fallback systems 