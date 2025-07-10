import type { Metadata } from "next";
import Image from "next/image";

export const metadata: Metadata = {
  title: "SwipedIn - The Dating App for Job Applications",
  description: "Discover your dream job with a swipe! SwipedIn makes job hunting fun, fast, and personal. Swipe right to apply, left to pass—just like dating, but for your career.",
  openGraph: {
    title: "SwipedIn - The Dating App for Job Applications",
    description: "Discover your dream job with a swipe! SwipedIn makes job hunting fun, fast, and personal.",
    images: [
      {
        url: "/logo.svg",
        width: 1200,
        height: 630,
        alt: "SwipedIn Logo",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "SwipedIn - The Dating App for Job Applications",
    description: "Discover your dream job with a swipe! SwipedIn makes job hunting fun, fast, and personal.",
    images: ["/logo.svg"],
  },
};

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
        <div className="absolute top-40 left-40 w-80 h-80 bg-indigo-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
      </div>

      {/* Header */}
      <header className="relative z-10 w-full py-8 flex flex-col items-center">
        <div className="flex items-center justify-center mb-6">
          <div className="relative w-24 h-24 md:w-32 md:h-32">
            <Image
              src="/logo.svg"
              alt="SwipedIn Logo"
              fill
              className="object-contain drop-shadow-lg"
              priority
            />
          </div>
        </div>
        
        <h1 className="text-4xl md:text-6xl font-extrabold bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent mb-4 drop-shadow-sm">
          SwipedIn
        </h1>
        
        <p className="text-xl md:text-2xl text-gray-700 font-medium mb-3 text-center">
          The dating app for job applications!
        </p>
        
        <p className="text-lg md:text-xl text-gray-600 max-w-2xl text-center mb-8 leading-relaxed">
          Discover jobs in saf fransicsco  dream job with a swipe! SwipedIn makes job hunting fun, fast, and personal. 
          Swipe right to apply, left to pass—just like dating, but for your career.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <a
            href="/profile"
            className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-8 py-4 rounded-full text-lg font-bold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 flex items-center justify-center gap-2"
          >
            <span>🚀</span>
            Get Started
          </a>
          <a
            href="/game"
            className="bg-white text-blue-600 border-2 border-blue-600 px-8 py-4 rounded-full text-lg font-bold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 flex items-center justify-center gap-2"
          >
            <span>🎮</span>
            Try Demo
          </a>
        </div>
      </header>

      {/* Features Section */}
      <section className="relative z-10 flex-1 flex flex-col items-center justify-center px-4 pb-16">
        <div className="max-w-6xl w-full">
          <h2 className="text-3xl md:text-4xl font-bold text-center text-gray-800 mb-12">
            Why Choose SwipedIn?
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl p-8 flex flex-col items-center text-center transform hover:scale-105 transition-all duration-300 border border-white/20">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg">
                <span className="text-2xl">💼</span>
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-4">Curated Job Matches</h3>
              <p className="text-gray-600 leading-relaxed">
                Get matched with jobs that fit your skills, interests, and goals. 
                No more endless scrolling—just relevant opportunities.
              </p>
            </div>
            
            <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl p-8 flex flex-col items-center text-center transform hover:scale-105 transition-all duration-300 border border-white/20">
              <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg">
                <span className="text-2xl">👆</span>
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-4">Swipe to Apply</h3>
              <p className="text-gray-600 leading-relaxed">
                Swipe right to apply, left to skip. It's fast, intuitive, and just like 
                your favorite dating apps—only for jobs!
              </p>
            </div>
            
            <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl p-8 flex flex-col items-center text-center transform hover:scale-105 transition-all duration-300 border border-white/20">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg">
                <span className="text-2xl">🤖</span>
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-4">AI-Powered Email Generator</h3>
              <p className="text-gray-600 leading-relaxed">
                Generate personalized emails for each job you apply to. Stand out to 
                employers with AI-optimized applications.
              </p>
            </div>
          </div>
          
          {/* Stats Section */}
          <div className="mt-16 grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 text-center border border-white/20">
              <div className="text-3xl font-bold text-blue-600 mb-2">1000+</div>
              <div className="text-gray-600">Jobs Available</div>
            </div>
            <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 text-center border border-white/20">
              <div className="text-3xl font-bold text-green-600 mb-2">AI</div>
              <div className="text-gray-600">Algorithmic Matching</div>
            </div>
            <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 text-center border border-white/20">
              <div className="text-3xl font-bold text-purple-600 mb-2">10s</div>
              <div className="text-gray-600">Email Generation</div>
            </div>
            <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 text-center border border-white/20">
              <div className="text-3xl font-bold text-indigo-600 mb-2">1 min</div>
              <div className="text-gray-600">Get Started</div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 w-full py-8 text-center">
        <div className="bg-white/60 backdrop-blur-sm border-t border-white/20">
          <div className="max-w-4xl mx-auto px-4 py-6">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 relative">
                  <Image
                    src="/logo.svg"
                    alt="SwipedIn Logo"
                    fill
                    className="object-contain"
                  />
                </div>
                <span className="text-gray-700 font-semibold">SwipedIn</span>
              </div>
              <div className="text-gray-600 text-sm">
                &copy; {new Date().getFullYear()} SwipedIn. All rights reserved.
              </div>
              {/*
              <div className="flex gap-4 text-sm">
                <a href="/privacy" className="text-gray-600 hover:text-blue-600 transition-colors">
                  Privacy
                </a>
                <a href="/terms" className="text-gray-600 hover:text-blue-600 transition-colors">
                  Terms
                </a>
              </div>
              */}
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
