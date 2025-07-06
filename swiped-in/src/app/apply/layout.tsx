import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Job applications",
  description: "Manage your job applications, generate custom emails, and track your job search progress.",
  openGraph: {
    title: "Job applications - SwipedIn",
    description: "Manage your job applications, generate custom emails, and track your job search progress.",
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
    title: "Job applications - SwipedIn",
    description: "Manage your job applications, generate custom emails, and track your job search progress.",
    images: ["/logo.svg"],
  },
};

export default function ApplyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}   