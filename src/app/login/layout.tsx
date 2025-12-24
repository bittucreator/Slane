/**
 * @author Shiva Nagendra Babu Kore
 */

import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Login - Access Your Tasks",
  description: "Sign in to your Slane account. Access your tasks, stay focused, and maintain your productivity flow. Secure login for solo builders.",
  keywords: [
    "login",
    "sign in",
    "task manager login",
    "secure access",
    "productivity login"
  ],
  openGraph: {
    title: "Login | Slane - Task Manager",
    description: "Sign in to access your minimalist task manager. Stay focused and productive.",
    url: "https://slane.app/login",
  },
  twitter: {
    title: "Login | Slane",
    description: "Sign in to access your minimalist task manager. Stay focused and productive.",
  },
  robots: {
    index: true, // Allow indexing for better user discovery
    follow: true,
  },
};

export default function LoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
