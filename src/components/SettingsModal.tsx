/**
 * @author Shiva Nagendra Babu Kore
 */

import React, { useState, useEffect } from "react";
import { X, ChevronRight, HelpCircle, LogOut, Twitter } from "lucide-react";
import { Button } from "./ui/button";
import { useAuth } from "../contexts/AuthContext";
import { useUserPreferences } from "../hooks/useUserPreferences";
import Image from "next/image";
import { SupportModal } from "./SupportModal";
import Intercom from "@intercom/messenger-js-sdk";

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onThemeChange?: (theme: string) => void;
  onOpenThemeModal?: () => void;
}

// Simple Avatar component since we don't have it
const Avatar = ({
  className,
  children,
  src,
}: {
  className: string;
  children?: React.ReactNode;
  src?: string;
}) => (
  <div
    className={`rounded-lg flex items-center justify-center overflow-hidden ${className}`}
  >
    {src ? (
      <Image
        src={src}
        alt="Profile"
        width={40}
        height={40}
        className="w-full h-full object-cover"
        onError={(e) => {
          // If image fails to load, hide it and show fallback
          (e.target as HTMLImageElement).style.display = "none";
        }}
      />
    ) : null}
    {children}
  </div>
);

const AvatarFallback = ({
  className,
  children,
}: {
  className: string;
  children: React.ReactNode;
}) => <div className={className}>{children}</div>;

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  onThemeChange,
  onOpenThemeModal,
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [showSupportModal, setShowSupportModal] = useState(false);
  const [selectedTheme, setSelectedTheme] = useState<string>("default");
  const [hoveredTheme, setHoveredTheme] = useState<string | null>(null);
  const [tempSelectedTheme, setTempSelectedTheme] = useState<string>("default");
  const [intercomInitialized, setIntercomInitialized] = useState(false);
  const { user, signOut, loading } = useAuth();
  const { preferences, updateWallpaper } = useUserPreferences();

  // Available themes

  // Load theme from user preferences or localStorage as fallback
  useEffect(() => {
    if (preferences?.wallpaper_id) {
      // Use database value if available
      setSelectedTheme(preferences.wallpaper_id);
    } else {
      // Fallback to localStorage for backwards compatibility
      const savedTheme = localStorage.getItem("dashboard-theme");
      if (savedTheme) {
        setSelectedTheme(savedTheme);
      }
    }
  }, [preferences]);



  // Debug: Log the authentication state
  useEffect(() => {
    console.log("🔍 Settings Modal - Auth State:", {
      loading,
      user: user ? "User exists" : "No user",
      userEmail: user?.email,
      isOpen,
      identities: user?.identities,
      googleConnected: isGoogleConnected(),
    });
  }, [loading, user, isOpen]);

  // Extract user information from Google auth
  const getUserName = () => {
    if (user?.user_metadata?.full_name) return user.user_metadata.full_name;
    if (user?.user_metadata?.name) return user.user_metadata.name;
    if (user?.email) return user.email.split("@")[0];
    return "User";
  };

  const getUserEmail = () => user?.email || "No email available";

  const getUserAvatar = () => {
    if (!user) return null;

    // For Google auth users, prioritize Google avatar
    if (isGoogleConnected()) {
      return user.user_metadata?.avatar_url || 
             user.user_metadata?.picture || 
             null;
    }

    // For regular email auth, they might have a custom avatar in the future
    // For now, return null to show initials
    return user.user_metadata?.avatar_url || null;
  };

  const getInitials = () => {
    const name = getUserName();
    return name
      .split(" ")
      .map((part: string) => part[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  // Check if user has Google authentication provider
  const isGoogleConnected = () => {
    if (!user?.identities) return false;
    return user.identities.some((identity: any) => identity.provider === 'google');
  };

  const handleSignOut = async () => {
    try {
      setIsSigningOut(true);
      await signOut();
      handleClose();
    } catch (error: unknown) {
      console.error("Failed to sign out:", error);
      // Handle specific auth errors more gracefully
      let errorMessage = "An unexpected error occurred during sign out.";

      const errorObj = error as { message?: string };
      if (
        errorObj?.message?.includes("AuthSessionMissingError") ||
        errorObj?.message?.includes("Auth session missing")
      ) {
        errorMessage = "You are already signed out.";
        // If the session is already missing, just close the modal
        // The AuthContext will handle the redirect
        handleClose();
        return;
      } else if (errorObj?.message?.includes("Supabase is not configured")) {
        errorMessage = "Authentication service is not properly configured.";
      } else if (errorObj?.message) {
        errorMessage = errorObj.message;
      }

      alert(`Sign out failed: ${errorMessage}`);
      setIsSigningOut(false);
    }
  };

  const handleOpenSupport = () => {
    // Initialize Intercom if it hasn't been initialized yet
    if (!intercomInitialized) {
      try {
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
        setIntercomInitialized(true);
      } catch (error) {
        console.error("Failed to initialize Intercom:", error);
        // Fallback to support modal if Intercom initialization fails
        setShowSupportModal(true);
        return;
      }
    }

    // Open Intercom messenger directly
    if (window.Intercom) {
      window.Intercom("show");
    } else {
      // Fallback to support modal if Intercom is not available
      setShowSupportModal(true);
    }
  };

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
    } else {
      setIsVisible(false);
      setIsSigningOut(false); // Reset signing out state when modal closes
    }
  }, [isOpen]);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(() => {
      onClose();
    }, 300);
  };

  // Add Esc key handling
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        handleClose();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  // Cleanup Intercom when component unmounts
  useEffect(() => {
    return () => {
      if (intercomInitialized && window.Intercom) {
        window.Intercom("shutdown");
      }
    };
  }, [intercomInitialized]);

  if (!isOpen) return null;

  // Show loading state while authentication is being checked
  if (loading) {
    return (
      <div
        className={`fixed inset-0 z-50 transition-all duration-300 ease-out ${
          isVisible ? "bg-black/50" : "bg-black/0"
        } flex items-center justify-center p-4 sm:block sm:p-0`}
      >
        <div className="bg-white text-vscode-text w-full max-w-[320px] sm:w-[320px] max-h-[600px] flex flex-col border border-vscode-border rounded p-8">
          <div className="text-center">
            <div className="animate-spin rounded h-8 w-8 border-b-2 border-vscode-text mx-auto mb-4"></div>
            <p className="text-vscode-text-muted">Loading your settings...</p>
          </div>
        </div>
      </div>
    );
  }

  // Show login prompt if user is not authenticated and not currently signing out
  if (!user && !isSigningOut) {
    return (
      <div
        className={`fixed inset-0 z-50 transition-all duration-300 ease-out ${
          isVisible ? "bg-black/50" : "bg-black/0"
        } flex items-center justify-center p-4 sm:block sm:p-0`}
        onClick={(e) => {
          if (e.target === e.currentTarget) {
            handleClose();
          }
        }}
      >
        <div className="bg-white text-vscode-text w-full max-w-[320px] sm:w-[320px] max-h-[600px] flex flex-col border border-vscode-border rounded p-8">
          <div className="text-center">
            <p className="text-vscode-text-muted mb-4">Please log in to view settings</p>
            <Button
              onClick={handleClose}
              className="mt-4 bg-vscode-button text-white hover:bg-vscode-button/90"
            >
              Close
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Settings Modal */}
      <div
        className={`fixed inset-0 z-50 transition-all duration-300 ease-out ${
          isVisible ? "bg-black/50" : "bg-black/0"
        } flex items-center justify-center p-4 sm:block sm:p-0`}
        onClick={(e) => {
          if (e.target === e.currentTarget) {
            handleClose();
          }
        }}
      >
        <div
          className={`bg-white text-vscode-text w-full max-w-[320px] sm:w-[320px] max-h-[600px] flex flex-col border border-vscode-border rounded transition-all duration-300 ease-out transform sm:fixed sm:top-20 sm:right-6 ${
            isVisible
              ? "scale-100 opacity-100 translate-y-0"
              : "scale-95 opacity-0 translate-y-4"
          }`}
        >
          {/* Header */}
          <div className="relative px-4 py-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={handleClose}
              className="absolute top-2 right-2 text-vscode-text-muted hover:text-vscode-text h-7 w-7 transition-colors hover:bg-vscode-sidebar rounded"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>

          {/* Profile Section */}
          <div className="flex flex-col items-center px-4 pb-4">
            <Avatar
              className="w-12 h-12 mb-2 bg-vscode-sidebar border-2 border-vscode-border"
              src={getUserAvatar()}
            >
              {!getUserAvatar() && (
                <AvatarFallback className="text-sm text-vscode-text font-medium">
                  {getInitials()}
                </AvatarFallback>
              )}
            </Avatar>
            <div className="flex items-center gap-2 mb-1">
              <h2 className="text-base font-semibold text-vscode-text">
                {getUserName()}
              </h2>
            </div>
            <p className="text-xs text-vscode-text-muted mt-1">{getUserEmail()}</p>
          </div>

          {/* Account Section */}
          <div className="px-4 pb-3">
            <h3 className="text-[10px] uppercase tracking-wider text-vscode-text-muted mb-2">Account</h3>
            <div className="border border-vscode-border rounded bg-vscode-sidebar p-0">
              {/* Email */}
              <div className="flex items-center justify-between py-2 px-3 border-b border-vscode-border">
                <span className="text-sm font-medium text-vscode-text">Email</span>
                <span
                  className="text-sm text-vscode-text-muted truncate max-w-[150px]"
                  title={getUserEmail()}
                >
                  {getUserEmail()}
                </span>
              </div>

              {/* Account Created */}
              {user?.created_at && (
                <div className="flex items-center justify-between py-2 px-3 border-b border-vscode-border">
                  <span className="text-sm font-medium text-vscode-text">
                    Created
                  </span>
                  <span className="text-sm text-vscode-text-muted">
                    {new Date(user.created_at).toLocaleDateString()}
                  </span>
                </div>
              )}

              {/* Google Connection */}
              <div className="flex items-center justify-between py-2 px-3 min-h-[40px]">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-lg overflow-hidden flex-shrink-0">
                    <svg viewBox="0 0 24 24" className="w-full h-full">
                      <path
                        fill="#4285F4"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      />
                      <path
                        fill="#34A853"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      />
                      <path
                        fill="#FBBC05"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                      />
                      <path
                        fill="#EA4335"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      />
                    </svg>
                  </div>
                  <span className="text-sm font-medium text-vscode-text">
                    Google
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  {isGoogleConnected() ? (
                    <>
                      <div className="w-2 h-2 bg-[#3794ff] rounded-full"></div>
                      <span className="text-sm text-[#3794ff] font-regular">
                        Connected
                      </span>
                    </>
                  ) : (
                    <>
                      <div className="w-2 h-2 bg-vscode-text-muted rounded-full"></div>
                      <span className="text-sm text-vscode-text-muted font-medium">
                        Not connected
                      </span>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Others Section */}
          <div className="px-4 pb-3">
            <div className="mt-3">
              <h2 className="text-[10px] uppercase tracking-wider text-vscode-text-muted mb-2">More</h2>
              <div className="border border-vscode-border rounded bg-vscode-sidebar p-0">
                {/* Help & Support */}
                <button
                  onClick={handleOpenSupport}
                  className="w-full flex items-center justify-between py-2 px-3 border-b border-vscode-border text-left hover:bg-vscode-sidebar transition-colors rounded-t"
                >
                  <div className="flex items-center gap-2">
                    <HelpCircle className="w-4 h-4 text-vscode-text-muted" />
                    <span className="text-sm font-medium text-vscode-text">
                      Help & support
                    </span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-vscode-text-muted" />
                </button>

                {/* Follow on X */}
                <button
                  onClick={() => window.open('https://x.com/useslane', '_blank')}
                  className="w-full flex items-center justify-between py-2 px-3 border-b border-vscode-border text-left hover:bg-vscode-sidebar transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <Twitter className="w-4 h-4 text-vscode-text-muted" />
                    <span className="text-sm font-medium text-vscode-text">
                      Follow on X
                    </span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-vscode-text-muted" />
                </button>

                {/* Sign Out */}
                <button
                  onClick={handleSignOut}
                  className="w-full flex items-center justify-between py-2 px-3 text-left hover:bg-vscode-sidebar transition-colors rounded-b"
                >
                  <div className="flex items-center gap-2">
                    <LogOut className="w-4 h-4 text-[#f48771]" />
                    <span className="text-sm font-medium text-[#f48771]">
                      Sign out
                    </span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-vscode-text-muted" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Support Modal */}
        <SupportModal
          isOpen={showSupportModal}
          onClose={() => setShowSupportModal(false)}
        />
      </div>
    </>
  );
};
