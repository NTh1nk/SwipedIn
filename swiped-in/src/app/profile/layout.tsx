import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Resume Analyzer",
  description: "Upload your resume and get AI-powered insights and summaries for better job applications.",
  openGraph: {
    title: "Resume Analyzer - SwipedIn",
    description: "Upload your resume and get AI-powered insights and summaries for better job applications.",
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
    title: "Resume Analyzer - SwipedIn",
    description: "Upload your resume and get AI-powered insights and summaries for better job applications.",
    images: ["/logo.svg"],
  },
};

export default function ProfileLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
} 