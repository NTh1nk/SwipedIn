import { useState, useCallback } from 'react';

interface EmbeddingResponse {
  embedding: number[];
  model_cached: boolean;
}

interface UseEmbeddingsReturn {
  generateEmbedding: (text: string) => Promise<number[]>;
  isLoading: boolean;
  error: string | null;
  isModelLoaded: boolean;
}

export function useEmbeddings(): UseEmbeddingsReturn {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isModelLoaded, setIsModelLoaded] = useState(false);

  const generateEmbedding = useCallback(async (text: string): Promise<number[]> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/vector/embedding', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: EmbeddingResponse = await response.json();
      setIsModelLoaded(data.model_cached);
      return data.embedding;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to generate embedding';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    generateEmbedding,
    isLoading,
    error,
    isModelLoaded,
  };
} 