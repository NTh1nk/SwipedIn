import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Swipe through jobs",
  description: "Swipe through job opportunities! Swipe right to apply, left to pass. Find your dream job with our interactive job matching game.",
  openGraph: {
    title: "Swipe through jobs - SwipedIn",
    description: "Swipe through job opportunities! Swipe right to apply, left to pass. Find your dream job with our interactive job matching game.",
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
    title: "Swipe through jobs - SwipedIn",
    description: "Swipe through job opportunities! Swipe right to apply, left to pass. Find your dream job with our interactive job matching game.",
    images: ["/logo.svg"],
  },
};

export default function GameLayout({
  children,
}: {
  children: React.ReactNode;    
}) {
  return children;
} 