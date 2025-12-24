/**
 * @author Shiva Nagendra Babu Kore
 */

"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { useGuestOnly } from "../../hooks/useAuthRedirect";

export default function ForgotPassword() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [email, setEmail] = useState("");
  const [isEmailSent, setIsEmailSent] = useState(false);

  // Redirect authenticated users
  useGuestOnly();

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email) {
      setError("Please enter your email address");
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

      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) {
        throw error;
      }

      setIsEmailSent(true);
      setError(null);
    } catch (error) {
      console.error("Password reset error:", error);
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError("Failed to send password reset email. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8">
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
          {isEmailSent ? "Check your email" : "Reset your password"}
        </h1>
        {!isEmailSent && (
          <p className="text-gray-600 text-sm">
            Enter your email address and we&apos;ll send you a reset link
          </p>
        )}
      </div>

      {/* Forgot Password Form */}
      <div className="w-full max-w-sm sm:max-w-md">
        {isEmailSent ? (
          /* Success State */
          <div className="text-center space-y-4">
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-full">
              <p className="text-sm text-green-600">
                Password reset email sent to{" "}
                <span className="font-medium">{email}</span>
              </p>
            </div>
            <p className="text-gray-600 text-sm mb-6">
              Please check your inbox and click the link to reset your password.
              Don&apos;t forget to check your spam folder!
            </p>
            <div className="space-y-3">
              <button
                onClick={() => {
                  setIsEmailSent(false);
                  setEmail("");
                  setError(null);
                }}
                className="w-full text-gray-600 hover:text-gray-900 text-sm font-medium underline transition-colors"
              >
                Send to a different email
              </button>
              <Link
                href="/login"
                className="block w-full text-center bg-black text-white py-3 rounded-full font-medium hover:bg-gray-800 transition-colors text-sm sm:text-base"
              >
                Back to Sign In
              </Link>
            </div>
          </div>
        ) : (
          /* Form State */
          <>
            {/* Error Message */}
            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-full">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            {/* Email Form */}
            <form onSubmit={handleForgotPassword} className="space-y-4 mb-6">
              <div>
                <input
                  type="email"
                  placeholder="Email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 bg-white border border-gray-300 rounded-full text-gray-900 placeholder-gray-400 focus:bg-white focus:ring-2 focus:ring-black focus:border-transparent focus:outline-none transition-all text-sm sm:text-base"
                  required
                  disabled={isLoading}
                />
              </div>
              <button
                type="submit"
                disabled={isLoading || !email}
                className="w-full bg-black text-white py-3 rounded-full font-medium hover:bg-gray-800 transition-colors text-sm sm:text-base disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? "Sending reset email..." : "Send reset email"}
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
        )}
      </div>
    </div>
  );
}
