/**
 * @author Shiva Nagendra Babu Kore
 */

import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Our Team - Meet the Builders",
  description: "Meet the passionate team behind Slane. Solo builders creating minimalist productivity tools for fellow entrepreneurs, developers, and indie makers.",
  keywords: [
    "slane team",
    "founders",
    "indie makers",
    "productivity team",
    "solo builders",
    "startup team",
    "about us"
  ],
  openGraph: {
    title: "Our Team | Slane - Meet the Builders Behind the App",
    description: "Meet the passionate team creating minimalist productivity tools for solo builders and indie makers.",
    url: "https://slane.app/team",
    images: [
      {
        url: "/Praneeth_Narisetty.png",
        width: 400,
        height: 400,
        alt: "Slane Team Member",
      },
    ],
  },
  twitter: {
    title: "Our Team | Slane",
    description: "Meet the passionate team creating minimalist productivity tools for solo builders and indie makers.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function TeamLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
