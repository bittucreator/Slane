/**
 * @author Shiva Nagendra Babu Kore
 */

import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "../contexts/AuthContext";
import { ClientAnalytics } from "../components/ClientAnalytics";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  metadataBase: new URL('https://slane.app'),
  title: {
    default: "Slane - The Minimalist Task Manager for Solo Builders",
    template: "%s | Slane",
  },
  description: "The minimalist task manager designed for solo builders. No teams, no clutter - just one clean list to help you stay in flow.",
  keywords: [
    // Core keywords
    "task manager",
    "todo app",
    "productivity app",
    "task management",
    "todo list",
    "task tracker",
    "project management",
    
    // Solo builder specific
    "solo builder tools",
    "indie maker productivity",
    "freelancer task manager",
    "entrepreneur productivity",
    "developer tools",
    "startup productivity",
    "remote work tools",
    "digital nomad apps",
    
    // Minimalist/focused keywords
    "minimalist todo",
    "simple task manager",
    "clean interface",
    "distraction-free",
    "focused productivity",
    "minimal design",
    "clutter-free",
    "simple todo app",
    
    // Free/pricing keywords
    "free task manager",
    "free todo app",
    "no subscription",
    "lifetime deal",
    "affordable productivity",
    "cheap task manager",
    
    // Technical features
    "PWA app",
    "offline tasks",
    "web app",
    "mobile task manager",
    "sync tasks",
    "cloud tasks",
    "progressive web app",
    
    // Action-oriented
    "get organized",
    "stay productive",
    "manage tasks",
    "organize work",
    "plan tasks",
    "track progress",
    "complete tasks",
    
    // Competitive terms
    "todoist alternative",
    "asana alternative",
    "notion alternative",
    "trello alternative",
    "monday alternative",
    "clickup alternative",
    
    // Trending productivity keywords
    "productivity hack",
    "time management",
    "workflow optimization",
    "deep work",
    "focus app",
    "concentration tool",
    "habit tracker",
    "goal setting",
    
    // Long-tail keywords
    "best task manager for developers",
    "simple todo app for entrepreneurs",
    "minimalist productivity tool",
    "task manager without teams",
    "personal task organizer",
    "lightweight task tracker",
    "fast todo app",
    "clean task interface",
    
    // Industry buzzwords
    "productivity suite",
    "workflow tool",
    "task automation",
    "efficiency app",
    "performance tracker",
    "work organizer",
    "daily planner",
    "task scheduler"
  ],
  authors: [
    { name: "Praneeth Narisetty" },
    { name: "Shiva Nagendra Babu Kore" },
    { name: "Venkat" },
    { name: "Slane Team", url: "https://slane.app/team" }
  ],
  creator: "Slane",
  publisher: "Slane",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  icons: {
    icon: [
      { url: "/favicon.svg", sizes: "any", type: "image/svg+xml" },
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    shortcut: "/favicon.svg",
    apple: "/favicon.png",
  },
  manifest: "/manifest.json",
  openGraph: {
    title: "Slane - The Minimalist Task Manager for Solo Builders",
    description: "The minimalist task manager designed for solo builders. No teams, no clutter - just one clean list to help you stay in flow.",
    url: "https://slane.app",
    siteName: "Slane",
    images: [
      {
        url: "/home.png",
        width: 1200,
        height: 800,
        alt: "Slane Task Manager Interface",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Slane - The Minimalist Task Manager for Solo Builders",
    description: "The minimalist task manager designed for solo builders. No teams, no clutter - just one clean list to help you stay in flow.",
    site: "@useslane",
    creator: "@useslane",
    images: ["/home.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    // Add your verification codes here when you get them
    // google: "your-google-verification-code",
    // yandex: "your-yandex-verification-code",
    // yahoo: "your-yahoo-verification-code",
  },
  category: "technology",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
        <meta name="theme-color" content="#000000" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Slane" />
        <meta name="mobile-web-app-capable" content="yes" />
        <link rel="canonical" href="https://slane.app" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://fonts.googleapis.com" />
        <link rel="dns-prefetch" href="https://fonts.gstatic.com" />
      </head>
      <body
        className={`${inter.variable} font-sans antialiased`}
        suppressHydrationWarning={true}
      >
        <AuthProvider>
          {children}
        </AuthProvider>
        <ClientAnalytics />
      </body>
    </html>
  );
}
