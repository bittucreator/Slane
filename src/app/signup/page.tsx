/**
 * @author Shiva Nagendra Babu Kore
 */

"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useRef, useEffect } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { useGuestOnly } from "../../hooks/useAuthRedirect";
import { useRouter } from "next/navigation";
import { ENV } from "../../lib/constants";
import HCaptcha from "@hcaptcha/react-hcaptcha";

export default function Signup() {
  const [isEmailLoading, setIsEmailLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [signupAttempts, setSignupAttempts] = useState(0);
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const [showCaptcha, setShowCaptcha] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [userEmail, setUserEmail] = useState("");
  const [countdown, setCountdown] = useState(10);
  const captchaRef = useRef<HCaptcha>(null);
  const { signInWithGoogle, signUpWithEmail } = useAuth();
  const router = useRouter();

  // Redirect authenticated users
  useGuestOnly();

  // Countdown timer for email confirmation
  useEffect(() => {
    if (emailSent && countdown > 0) {
      const timer = setTimeout(() => {
        setCountdown(countdown - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (emailSent && countdown === 0) {
      router.push("/login");
    }
  }, [emailSent, countdown, router]);

  const handleEmailSignup = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    // Check if captcha is required and if it's been completed
    if (showCaptcha && !captchaToken) {
      setError("Please complete the captcha verification");
      return;
    }

    try {
      setIsEmailLoading(true);
      setError(null);

      // Call Supabase email signup
      const result = await signUpWithEmail(email, password);

      // Check if email confirmation is required
      if (result.requiresEmailConfirmation) {
        setUserEmail(email);
        setEmailSent(true);
        setCountdown(10);
        return;
      }

      // Reset form on successful signup (direct login without confirmation)
      setEmail("");
      setPassword("");
      setConfirmPassword("");
      setSignupAttempts(0);
      setShowCaptcha(false);
      setCaptchaToken(null);
    } catch (error) {
      console.error("Signup error:", error);

      // Increment signup attempts on failure
      const newAttempts = signupAttempts + 1;
      setSignupAttempts(newAttempts);

      // Show captcha after 3 failed attempts
      if (newAttempts >= 3) {
        setShowCaptcha(true);
      }

      // Reset captcha after attempt
      if (captchaRef.current) {
        captchaRef.current.resetCaptcha();
        setCaptchaToken(null);
      }

      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError("An unexpected error occurred");
      }
    } finally {
      setIsEmailLoading(false);
    }
  };

  const onCaptchaChange = (token: string | null) => {
    setCaptchaToken(token);
    if (token) {
      setError(null); // Clear error when captcha is completed
    }
  };

  const onCaptchaExpire = () => {
    setCaptchaToken(null);
  };

  const handleGoogleSignup = async () => {
    try {
      setIsGoogleLoading(true);
      setError(null);
      await signInWithGoogle();
      // The signInWithGoogle function handles the redirect
    } catch (error) {
      console.error("Signup error:", error);
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError("An unexpected error occurred");
      }
    } finally {
      setIsGoogleLoading(false);
    }
  };

  if (emailSent) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8">
        {/* Success Message */}
        <div className="w-full max-w-md mx-auto text-center">
          <div className="mb-6 p-6 rounded-full">
            <div className="flex justify-center mb-4">
              <svg
                className="w-12 h-12 text-green-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-black mb-3">
              Check your email!
            </h2>
            <p className="text-black mb-4">
              We've sent a confirmation link to:
            </p>
            <p className="text-black font-medium mb-4">{userEmail}</p>
          </div>

          {/* Countdown */}
          <div className="text-center">
            <p className="text-black text-sm mb-2">
              Redirecting to login page in {countdown} seconds...
            </p>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-green-500 h-2 rounded-full transition-all duration-1000 ease-linear"
                style={{ width: `${((10 - countdown) / 10) * 100}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8">
      {/* Logo */}
      <div className="mb-6 sm:mb-8">
        <Link href="/" className="inline-block">
          <Image
            src="/Slane.png"
            alt="Slane Logo"
            width={32}
            height={32}
            className="w-10 h-10 sm:w-12 sm:h-12 mx-auto cursor-pointer hover:opacity-80 transition-opacity"
          />
        </Link>
      </div>

      {/* Welcome Text */}
      <div className="text-center mb-6 sm:mb-8">
        <h1 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-2">
          Create your account
        </h1>
      </div>

      {/* Signup Form */}
      <div className="w-full max-w-sm sm:max-w-md">
        {/* Error Message */}
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-full">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        {/* Email Signup Form */}
        <form onSubmit={handleEmailSignup} className="space-y-4 mb-6">
          <div>
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 bg-white border border-gray-300 rounded-full text-gray-900 placeholder-gray-400 focus:bg-white focus:ring-2 focus:ring-black focus:border-transparent focus:outline-none transition-all text-sm sm:text-base"
              required
              disabled={isEmailLoading || isGoogleLoading}
            />
          </div>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 pr-12 bg-white border border-gray-300 rounded-full text-gray-900 placeholder-gray-400 focus:bg-white focus:ring-2 focus:ring-black focus:border-transparent focus:outline-none transition-all text-sm sm:text-base"
              required
              disabled={isEmailLoading || isGoogleLoading}
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
              placeholder="Confirm Password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-4 py-3 pr-12 bg-white border border-gray-300 rounded-full text-gray-900 placeholder-gray-400 focus:bg-white focus:ring-2 focus:ring-black focus:border-transparent focus:outline-none transition-all text-sm sm:text-base"
              required
              disabled={isEmailLoading || isGoogleLoading}
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
          {/* hCaptcha */}
          {showCaptcha && (
            <div className="mb-4 flex justify-center">
              <HCaptcha
                ref={captchaRef}
                sitekey={ENV.HCAPTCHA_SITE_KEY}
                onVerify={onCaptchaChange}
                onExpire={onCaptchaExpire}
                theme="light"
              />
            </div>
          )}

          <button
            type="submit"
            disabled={isEmailLoading}
            className="w-full bg-black text-white py-3 rounded-full font-medium hover:bg-gray-800 transition-colors text-sm sm:text-base disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isEmailLoading ? "Creating account..." : "Create Account"}
          </button>
        </form>

        {/* Divider */}
        <div className="relative mb-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-gray-50 text-gray-500">or</span>
          </div>
        </div>

        {/* Continue with Google Button */}
        <button
          onClick={handleGoogleSignup}
          disabled={isGoogleLoading}
          className="w-full flex items-center justify-center gap-2 sm:gap-3 bg-white border border-gray-300 rounded-full px-4 sm:px-6 py-3 sm:py-3.5 text-gray-700 font-medium hover:bg-gray-50 active:bg-gray-100 transition-colors mb-4 text-sm sm:text-base touch-manipulation focus:outline-none focus:ring-2 focus:ring-gray-300 focus:ring-opacity-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <svg
            className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0"
            viewBox="0 0 24 24"
          >
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
          <span className="truncate">
            {isGoogleLoading ? "Signing up..." : "Continue with Google"}
          </span>
        </button>

        {/* Login Link */}
        <div className="text-center">
          <span className="text-gray-600 text-xs sm:text-sm">
            Already have an account?{" "}
          </span>
          <Link
            href="/login"
            className="text-gray-900 font-semibold text-xs sm:text-sm hover:underline"
          >
            Log in
          </Link>
        </div>
      </div>
    </div>
  );
}
