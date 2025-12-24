/**
 * @author Shiva Nagendra Babu Kore
 */

import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign Up - Start Free",
  description: "Join thousands of solo builders using Slane. Create your free account and get up to 100 tasks. No credit card required. Simple, focused task management.",
  keywords: [
    "sign up free",
    "create account",
    "task manager signup",
    "free productivity app",
    "solo builder tools",
    "minimalist todo"
  ],
  openGraph: {
    title: "Sign Up Free | Slane - Task Manager for Solo Builders",
    description: "Join thousands of solo builders. Create your free Slane account - up to 100 tasks, no credit card required.",
    url: "https://slane.app/signup",
    images: [
      {
        url: "/home.png",
        width: 1200,
        height: 800,
        alt: "Slane Signup - Free Task Manager",
      },
    ],
  },
  twitter: {
    title: "Sign Up Free | Slane",
    description: "Join thousands of solo builders. Create your free Slane account - up to 100 tasks, no credit card required.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function SignupLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
