"use client";

import { Analytics } from "@vercel/analytics/react";
import { useEffect, useState } from "react";

export function ClientAnalytics() {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return null;
  }

  return <Analytics />;
}
