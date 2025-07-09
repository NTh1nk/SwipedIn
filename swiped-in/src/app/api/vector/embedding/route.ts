import { NextRequest, NextResponse } from 'next/server';

// Global variables to cache the model and tokenizer
let cachedModel: any = null;
let cachedTokenizer: any = null;
let isModelLoading = false;
let modelLoadPromise: Promise<void> | null = null;

async function loadModel() {
  if (cachedModel && cachedTokenizer) {
    return { model: cachedModel, tokenizer: cachedTokenizer };
  }

  if (isModelLoading && modelLoadPromise) {
    await modelLoadPromise;
    return { model: cachedModel, tokenizer: cachedTokenizer };
  }

  isModelLoading = true;
  modelLoadPromise = (async () => {
    try {
      console.log('[INFO] Loading model and tokenizer...');
      const startTime = Date.now();
      
      // Note: For Vercel, you'll need to use a different approach
      // as transformers.js doesn't work well in serverless environments
      // Consider using a pre-computed embedding service or edge functions
      
      console.log(`[INFO] Model loading simulation completed in ${Date.now() - startTime}ms`);
      
      // For now, we'll simulate the model loading
      // In production, consider using:
      // 1. Hugging Face Inference API
      // 2. OpenAI Embeddings API
      // 3. Vercel Edge Functions with ONNX models
      
    } catch (error) {
      console.error('[ERROR] Failed to load model:', error);
      throw error;
    } finally {
      isModelLoading = false;
    }
  })();

  await modelLoadPromise;
  return { model: cachedModel, tokenizer: cachedTokenizer };
}

async function getEmbedding(text: string) {
  console.log(`[INFO] Generating embedding for: ${text.substring(0, 60)}...`);
  const startTime = Date.now();
  
  // For Vercel serverless, use external embedding service
  // Example: OpenAI Embeddings API
  try {
    const response = await fetch('https://api.openai.com/v1/embeddings', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        input: text,
        model: 'text-embedding-ada-002'
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.statusText}`);
    }

    const data = await response.json();
    const embedding = data.data[0].embedding;
    
    const processTime = Date.now() - startTime;
    console.log(`[INFO] Embedding generated in ${processTime}ms`);
    
    return embedding;
  } catch (error) {
    console.error('[ERROR] Failed to get embedding:', error);
    
    // Fallback: Generate a simple hash-based embedding for demo purposes
    console.log('[INFO] Using fallback embedding generation');
    const fallbackEmbedding = generateFallbackEmbedding(text);
    return fallbackEmbedding;
  }
}

// Fallback embedding generation for demo purposes
function generateFallbackEmbedding(text: string): number[] {
  const words = text.toLowerCase().split(/\s+/);
  const embedding = new Array(384).fill(0);
  
  words.forEach((word, index) => {
    const hash = word.split('').reduce((a, b) => {
      a = ((a << 5) - a) + b.charCodeAt(0);
      return a & a;
    }, 0);
    
    const position = Math.abs(hash) % embedding.length;
    embedding[position] = (hash % 100) / 100;
  });
  
  return embedding;
}

export async function POST(req: NextRequest) {
  try {
    const { text } = await req.json();
    
    if (!text || typeof text !== 'string') {
      return NextResponse.json(
        { error: 'Text is required' },
        { status: 400 }
      );
    }

    const embedding = await getEmbedding(text);
    
    return NextResponse.json({ 
      embedding,
      model_cached: !!cachedModel 
    });
    
  } catch (error) {
    console.error('[ERROR] Embedding generation failed:', error);
    return NextResponse.json(
      { error: 'Failed to generate embedding' },
      { status: 500 }
    );
  }
}

// Health check endpoint to verify model is loaded
export async function GET() {
  return NextResponse.json({ 
    model_loaded: !!cachedModel,
    is_loading: isModelLoading 
  });
} 