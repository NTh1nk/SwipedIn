import { ReactNode } from 'react';

interface VectorLayoutProps {
  children: ReactNode;
}

export default function VectorLayout({ children }: VectorLayoutProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto">
        <nav className="py-4 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold text-gray-800">Vector AI</h1>
              <span className="text-sm text-gray-600">Job Matching with Embeddings</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-sm text-gray-600">AI Ready</span>
            </div>
          </div>
        </nav>
        
        <main>
          {children}
        </main>
        
        <footer className="mt-12 py-6 text-center text-gray-500 text-sm">
          <p>Powered by Vector Embeddings & AI</p>
        </footer>
      </div>
    </div>
  );
} 