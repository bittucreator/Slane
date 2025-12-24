/**
 * @author Shiva Nagendra Babu Kore
 */

"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "../../contexts/AuthContext";

// Component that uses useSearchParams wrapped in Suspense
function ResetPasswordForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isPasswordReset, setIsPasswordReset] = useState(false);
  const [isValidSession, setIsValidSession] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, loading } = useAuth();

  // Check for valid reset session
  useEffect(() => {
    const checkResetSession = async () => {
      // Check URL parameters for reset tokens
      const accessToken = searchParams.get("access_token");
      const refreshToken = searchParams.get("refresh_token");
      const type = searchParams.get("type");
      const error = searchParams.get("error");
      const errorCode = searchParams.get("error_code");

      // Handle errors in URL
      if (error) {
        if (errorCode === "otp_expired") {
          setError(
            "Reset link has expired. Please request a new password reset."
          );
        } else {
          setError("Invalid reset link. Please request a new password reset.");
        }
        return;
      }

      // If we have recovery tokens, set up session
      if (type === "recovery" && accessToken && refreshToken) {
        try {
          const { supabase } = await import("../../lib/supabase");
          if (!supabase) {
            setError(
              "Password reset is not available. Please contact support."
            );
            return;
          }

          // Set the session with the tokens from the URL
          const { error: sessionError } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          });

          if (sessionError) {
            setError(
              "Invalid or expired reset link. Please request a new password reset."
            );
          } else {
            setIsValidSession(true);
          }
        } catch (err) {
          console.error("Session setup error:", err);
          setError("Failed to validate reset link. Please try again.");
        }
        return;
      }

      // If user is already logged in (from previous reset link click), allow password change
      if (user && !loading) {
        setIsValidSession(true);
        return;
      }

      // If no tokens and no user, invalid access
      if (!loading) {
        setError("Invalid access. Please use the reset link from your email.");
      }
    };

    checkResetSession();
  }, [searchParams, user, loading]);

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!password || !confirmPassword) {
      setError("Please fill in all fields");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters long");
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      // Import supabase here since we need it
      const { supabase } = await import("../../lib/supabase");

      if (!supabase) {
        setError("Password reset is not available. Please contact support.");
        return;
      }

      const { error } = await supabase.auth.updateUser({
        password: password,
      });

      if (error) {
        throw error;
      }

      setIsPasswordReset(true);
      setError(null);

      // Sign out the user after password reset so they can log in with new password
      setTimeout(async () => {
        try {
          const { supabase } = await import("../../lib/supabase");
          if (supabase) {
            await supabase.auth.signOut();
          }
        } catch (err) {
          console.error("Sign out error:", err);
        }
      }, 2000); // Wait 2 seconds to show success message
    } catch (error) {
      console.error("Password reset error:", error);
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError("Failed to reset password. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8">
      {/* Logo */}
      <div className="mb-6 sm:mb-8">
        <Image
          src="/Slane.png"
          alt="Slane Logo"
          width={48}
          height={48}
          className="w-10 h-10 sm:w-12 sm:h-12 mx-auto"
        />
      </div>

      {/* Welcome Text */}
      <div className="text-center mb-6 sm:mb-8">
        <h1 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-2">
          {isPasswordReset ? "Password updated!" : "Set new password"}
        </h1>
        {!isPasswordReset && (
          <p className="text-gray-600 text-sm">Enter your new password below</p>
        )}
      </div>

      {/* Reset Password Form */}
      <div className="w-full max-w-sm sm:max-w-md">
        {loading ? (
          /* Loading State */
          <div className="text-center">
            <p className="text-gray-600 text-sm">Validating reset link...</p>
          </div>
        ) : !isValidSession && error ? (
          /* Error State */
          <div className="text-center space-y-4">
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-full">
              <p className="text-sm text-red-600">{error}</p>
            </div>
            <div className="space-y-3">
              <Link
                href="/forgot-password"
                className="block w-full text-center bg-black text-white py-3 rounded-full font-medium hover:bg-gray-800 transition-colors text-sm sm:text-base"
              >
                Request New Reset Link
              </Link>
              <Link
                href="/login"
                className="block w-full text-center text-gray-600 hover:text-gray-900 text-sm font-medium hover:underline"
              >
                Back to Sign In
              </Link>
            </div>
          </div>
        ) : isPasswordReset ? (
          /* Success State */
          <div className="text-center space-y-4">
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-full">
              <p className="text-sm text-green-600">
                Your password has been successfully updated!
              </p>
            </div>
            <p className="text-gray-600 text-sm mb-6">
              You can now sign in with your new password.
            </p>
            <Link
              href="/login"
              className="block w-full text-center bg-black text-white py-3 rounded-full font-medium hover:bg-gray-800 transition-colors text-sm sm:text-base"
            >
              Sign In
            </Link>
          </div>
        ) : isValidSession ? (
          /* Form State */
          <>
            {/* Error Message */}
            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-full">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            {/* Reset Password Form */}
            <form onSubmit={handleResetPassword} className="space-y-4 mb-6">
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="New password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 pr-12 bg-white border border-gray-300 rounded-full text-gray-900 placeholder-gray-400 focus:bg-white focus:ring-2 focus:ring-black focus:border-transparent focus:outline-none transition-all text-sm sm:text-base"
                  required
                  disabled={isLoading}
                  minLength={6}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showPassword ? (
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21"
                      />
                    </svg>
                  ) : (
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                      />
                    </svg>
                  )}
                </button>
              </div>
              <div className="relative">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Confirm new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-4 py-3 pr-12 bg-white border border-gray-300 rounded-full text-gray-900 placeholder-gray-400 focus:bg-white focus:ring-2 focus:ring-black focus:border-transparent focus:outline-none transition-all text-sm sm:text-base"
                  required
                  disabled={isLoading}
                  minLength={6}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showConfirmPassword ? (
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21"
                      />
                    </svg>
                  ) : (
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                      />
                    </svg>
                  )}
                </button>
              </div>
              <button
                type="submit"
                disabled={isLoading || !password || !confirmPassword}
                className="w-full bg-black text-white py-3 rounded-full font-medium hover:bg-gray-800 transition-colors text-sm sm:text-base disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? "Updating password..." : "Update password"}
              </button>
            </form>

            {/* Back to Login Link */}
            <div className="text-center">
              <Link
                href="/login"
                className="text-gray-600 hover:text-gray-900 text-xs sm:text-sm font-medium hover:underline"
              >
                ← Back to Sign In
              </Link>
            </div>
          </>
        ) : (
          /* Waiting for session validation */
          <div className="text-center">
            <p className="text-gray-600 text-sm">Loading...</p>
          </div>
        )}
      </div>
    </div>
  );
}

// Loading component for Suspense fallback
function ResetPasswordLoading() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8">
      <div className="mb-6 sm:mb-8">
        <Image
          src="/Slane.png"
          alt="Slane Logo"
          width={48}
          height={48}
          className="w-10 h-10 sm:w-12 sm:h-12 mx-auto"
        />
      </div>
      <div className="text-center">
        <p className="text-gray-600 text-sm">Loading...</p>
      </div>
    </div>
  );
}

// Main component with Suspense boundary
export default function ResetPassword() {
  return (
    <Suspense fallback={<ResetPasswordLoading />}>
      <ResetPasswordForm />
    </Suspense>
  );
}
