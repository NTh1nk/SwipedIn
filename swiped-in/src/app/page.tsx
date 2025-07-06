import type { Metadata } from "next";

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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-200 flex flex-col justify-between">
      {/* Header */}
      <header className="w-full py-8 flex flex-col items-center">
        <h1 className="text-5xl md:text-6xl font-extrabold text-blue-800 mb-4 drop-shadow-lg">SwipedIn</h1>
        <p className="text-xl md:text-2xl text-blue-700 font-medium mb-2">The dating app for job applications!</p>
        <p className="text-md md:text-lg text-blue-600 max-w-xl text-center mb-6">
          Discover your dream job with a swipe! SwipedIn makes job hunting fun, fast, and personal. Swipe right to apply, left to pass—just like dating, but for your career.
        </p>
        <a
          href="/profile"
          className="mt-4 bg-blue-600 text-white px-8 py-4 rounded-full text-lg font-bold shadow-lg hover:bg-blue-700 transition"
        >
          Get started!
        </a>
      </header>

      {/* Features Section */}
      <section className="flex-1 flex flex-col items-center justify-center px-4">
        <div className="max-w-4xl w-full grid grid-cols-1 md:grid-cols-3 gap-8 mt-12 mb-16">
          <div className="bg-white rounded-2xl shadow-lg p-6 flex flex-col items-center">
            <span className="text-4xl mb-2">💼</span>
            <h3 className="text-lg font-bold text-blue-800 mb-2">Curated Job Matches</h3>
            <p className="text-gray-600 text-center">Get matched with jobs that fit your skills, interests, and goals. No more endless scrolling—just relevant opportunities.</p>
          </div>
          <div className="bg-white rounded-2xl shadow-lg p-6 flex flex-col items-center">
            <span className="text-4xl mb-2">👆</span>
            <h3 className="text-lg font-bold text-blue-800 mb-2">Swipe to Apply</h3>
            <p className="text-gray-600 text-center">Swipe right to apply, left to skip. It's fast, intuitive, and just like your favorite dating apps—only for jobs!</p>
          </div>
          <div className="bg-white rounded-2xl shadow-lg p-6 flex flex-col items-center">
            <span className="text-4xl mb-2">🤖</span>
            <h3 className="text-lg font-bold text-blue-800 mb-2">AI-Powered Email Generator</h3>
            <p className="text-gray-600 text-center">Generate personalized emails for each job you apply to. Stand out to employers with AI-optimized applications.</p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="w-full py-6 text-center text-blue-700 text-sm bg-blue-100 border-t border-blue-200">
        &copy; {new Date().getFullYear()} SwipedIn. All rights reserved.
      </footer>
    </div>
  );
}
