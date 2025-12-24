/**
 * @author Shiva Nagendra Babu Kore
 */

"use client";

import React, { useEffect } from "react";
import Intercom from "@intercom/messenger-js-sdk";
import { useAuth } from "../contexts/AuthContext";

export default function IntercomChat() {
  const { user } = useAuth();

  useEffect(() => {
    // Initialize Intercom when component mounts
    if (user) {
      // User is authenticated - initialize with user data
      Intercom({
        app_id: "n9d0j6l8",
        user_id: user.id,
        name: user.user_metadata?.name || user.email?.split("@")[0] || "User",
        email: user.email,
        created_at: Math.floor(new Date(user.created_at).getTime() / 1000), // Convert to Unix timestamp in seconds
      });
    } else {
      // User is not authenticated - initialize without user data
      Intercom({
        app_id: "n9d0j6l8",
      });
    }

    // Cleanup function to shutdown Intercom when component unmounts
    return () => {
      if (window.Intercom) {
        window.Intercom("shutdown");
      }
    };
  }, [user]);

  // This component doesn't render anything visible
  return null;
}
