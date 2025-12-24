/**
 * @author Shiva Nagendra Babu Kore
 */

"use client";

import Image from "next/image";
import Link from "next/link";

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="px-4 sm:px-8 py-4 sm:py-6">
        <nav className="flex items-center justify-between">
          <Link
            href="/"
            className="flex items-center space-x-2 sm:space-x-3 hover:opacity-80 transition-opacity"
          >
            <Image
              src="/Slane.png"
              alt="Slane Logo"
              width={32}
              height={32}
              className="h-6 w-6 sm:h-8 sm:w-8"
            />
            <div className="text-xl sm:text-2xl font-bold">Slane</div>
          </Link>

          {/* Mobile & Desktop Auth */}
          <div className="flex items-center space-x-2 sm:space-x-4">
            <Link
              href="/login"
              className="text-black font-medium hover:text-gray-700 text-sm sm:text-base"
            >
              Login
            </Link>
            <Link
              href="/signup"
              className="bg-black text-white px-2 py-1 sm:px-3 sm:py-1.5 rounded-full text-xs sm:text-sm font-semibold hover:bg-gray-800 transition-colors"
            >
              Signup
            </Link>
          </div>
        </nav>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-6 sm:py-8 md:py-16">
        <div className="text-center mb-6 sm:mb-8 md:mb-16">
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-medium text-black mb-3 sm:mb-4 leading-tight">
            Privacy Policy
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 mb-4 sm:mb-6">
            Last updated: 20-09/2025
          </p>
          <p className="text-base sm:text-lg text-gray-600 max-w-2xl mx-auto px-4 sm:px-0">
            At Slane, we believe your tasks and data belong to you — not us. Our
            mission is to give you a clean, minimal productivity tool without
            selling your information or cluttering your experience.
          </p>
        </div>

        <div className="prose prose-sm sm:prose-lg max-w-none">
          {/* Section 1 */}
          <section className="mb-8 sm:mb-12">
            <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-4 sm:mb-6">
              1. Information We Collect
            </h2>
            <ul className="text-gray-600 space-y-2">
              <li>
                • Account Information: Email, password (encrypted), or Google
                account details if you sign in with Google.
              </li>
              <li>
                • Usage Data: Tasks, projects, and preferences you create in
                Slane.
              </li>
              <li>
                • Payment Data: If you subscribe to Slane Pro, payments are
                processed securely by our payment provider (Stripe/Polar). We
                never store your credit card details.
              </li>
            </ul>
          </section>

          {/* Section 2 */}
          <section className="mb-8 sm:mb-12">
            <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-4 sm:mb-6">
              2. How We Use Your Data
            </h2>
            <ul className="text-gray-600 space-y-2">
              <li>• To let you sign in and manage your account.</li>
              <li>• To save and sync your tasks across devices.</li>
              <li>• To process subscription payments.</li>
              <li>• To improve Slane and fix bugs.</li>
            </ul>
            <p className="text-gray-600 mt-4 font-medium">
              We do not sell your data to advertisers or third parties.
            </p>
          </section>

          {/* Section 3 */}
          <section className="mb-8 sm:mb-12">
            <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-4 sm:mb-6">
              3. Data Storage & Security
            </h2>
            <ul className="text-gray-600 space-y-2">
              <li>
                • Tasks and account data are stored securely in our database
                (Neon.tech PostgreSQL).
              </li>
              <li>• Passwords are encrypted with industry-standard methods.</li>
              <li>
                • We follow strict access controls so your data stays private.
              </li>
            </ul>
          </section>

          {/* Section 4 */}
          <section className="mb-8 sm:mb-12">
            <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-4 sm:mb-6">
              4. Your Rights
            </h2>
            <ul className="text-gray-600 space-y-2">
              <li>
                • You can request deletion of your account and all data anytime.
              </li>
              <li>
                • You can export your data (Pro feature) for personal backups.
              </li>
            </ul>
          </section>

          {/* Section 5 */}
          <section className="mb-8 sm:mb-12">
            <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-4 sm:mb-6">
              5. Third-Party Services
            </h2>
            <p className="text-gray-600 mb-4">Slane integrates with:</p>
            <ul className="text-gray-600 space-y-2">
              <li>• Stripe/Polar for payments.</li>
              <li>• Google OAuth for sign-in.</li>
            </ul>
            <p className="text-gray-600 mt-4">
              Each of these services has its own privacy practices.
            </p>
          </section>

          {/* Section 6 */}
          <section className="mb-8 sm:mb-12">
            <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-4 sm:mb-6">
              6. Contact Us
            </h2>
            <p className="text-gray-600">
              If you have questions about privacy, email us at:{" "}
              <a
                href="mailto:info@slane.app"
                className="text-black font-medium hover:underline"
              >
                info@slane.app
              </a>
            </p>
          </section>
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-12 sm:mt-24 pb-8 sm:pb-12 text-center">
        {/* Social Media Icons */}
        <div className="flex justify-center space-x-4 sm:space-x-6 mb-6 sm:mb-8">
          <a
            href="https://www.linkedin.com/company/slanehq/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block"
          >
            <button
              className="relative w-9 h-9 flex items-center justify-center border-none bg-transparent rounded-full cursor-pointer transition-all duration-300"
              onMouseEnter={(e) => {
                const bg = e.currentTarget.querySelector(
                  ".bg-element"
                ) as HTMLElement;
                const container = e.currentTarget.querySelector(
                  ".svg-container"
                ) as HTMLElement;
                if (bg) bg.style.transform = "rotate(35deg)";
                if (container) {
                  container.style.backgroundColor =
                    "rgba(156, 156, 156, 0.466)";
                }
              }}
              onMouseLeave={(e) => {
                const bg = e.currentTarget.querySelector(
                  ".bg-element"
                ) as HTMLElement;
                const container = e.currentTarget.querySelector(
                  ".svg-container"
                ) as HTMLElement;
                if (bg) bg.style.transform = "rotate(0deg)";
                if (container) {
                  container.style.backgroundColor = "transparent";
                }
              }}
            >
              <span
                className="svg-container w-full h-full flex items-center justify-center bg-transparent rounded-full transition-all duration-300"
                style={{
                  border: "1px solid rgba(156, 156, 156, 0.466)",
                  backdropFilter: "blur(0px)",
                  letterSpacing: "0.8px",
                }}
              >
                <svg
                  fill="white"
                  className="w-5 h-5"
                  viewBox="0 0 448 512"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M100.28 448H7.4V148.9h92.88zM53.79 108.1C24.09 108.1 0 83.5 0 53.8a53.79 53.79 0 0 1 107.58 0c0 29.7-24.1 54.3-53.79 54.3zM447.9 448h-92.68V302.4c0-34.7-.7-79.2-48.29-79.2-48.29 0-55.69 37.7-55.69 76.7V448h-92.78V148.9h89.08v40.8h1.3c12.4-23.5 42.69-48.3 87.88-48.3 94 0 111.28 61.9 111.28 142.3V448z" />
                </svg>
              </span>
              <span
                className="bg-element absolute inset-0 rounded-full pointer-events-none transition-all duration-300"
                style={{
                  background: "#181818",
                  zIndex: -1,
                  transformOrigin: "bottom",
                }}
              />
            </button>
          </a>
          <a
            href="https://x.com/useslane"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block"
          >
            <button
              className="relative w-9 h-9 flex items-center justify-center border-none bg-transparent rounded-full cursor-pointer transition-all duration-300 hover:transform"
              style={{
                transition: "all 0.3s ease",
              }}
              onMouseEnter={(e) => {
                const bg = e.currentTarget.querySelector(
                  ".bg-element"
                ) as HTMLElement;
                const container = e.currentTarget.querySelector(
                  ".svg-container"
                ) as HTMLElement;
                if (bg) bg.style.transform = "rotate(35deg)";
                if (container) {
                  container.style.backgroundColor =
                    "rgba(156, 156, 156, 0.466)";
                  container.style.backdropFilter = "blur(4px)";
                }
              }}
              onMouseLeave={(e) => {
                const bg = e.currentTarget.querySelector(
                  ".bg-element"
                ) as HTMLElement;
                const container = e.currentTarget.querySelector(
                  ".svg-container"
                ) as HTMLElement;
                if (bg) bg.style.transform = "rotate(0deg)";
                if (container) {
                  container.style.backgroundColor = "transparent";
                  container.style.backdropFilter = "blur(0px)";
                }
              }}
            >
              <span
                className="svg-container w-full h-full flex items-center justify-center bg-transparent rounded-full transition-all duration-300"
                style={{
                  border: "1px solid rgba(156, 156, 156, 0.466)",
                  backdropFilter: "blur(0px)",
                  letterSpacing: "0.8px",
                }}
              >
                <svg
                  viewBox="0 0 512 512"
                  className="w-5 h-5"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="white"
                >
                  <path d="M389.2 48h70.6L305.6 224.2 487 464H345L233.7 318.6 106.5 464H35.8L200.7 275.5 26.8 48H172.4L272.9 180.9 389.2 48zM364.4 421.8h39.1L151.1 88h-42L364.4 421.8z" />
                </svg>
              </span>
              <span
                className="bg-element absolute inset-0 rounded-full pointer-events-none transition-all duration-300"
                style={{
                  background: "#181818",
                  zIndex: -1,
                  transformOrigin: "bottom",
                }}
              />
            </button>
          </a>
        </div>

        {/* Copyright */}
        <div className="mb-4 sm:mb-6">
          <p className="text-gray-500 text-sm">© 2025 Slane, Inc.</p>
        </div>

        {/* Footer Links */}
        <div className="flex flex-row justify-center items-center space-x-4 sm:space-x-8">
          <Link
            href="/team"
            className="text-gray-600 hover:text-gray-900 text-sm"
          >
            Our Team
          </Link>
          <Link
            href="/privacy-policy"
            className="text-gray-600 hover:text-gray-900 text-sm"
          >
            Privacy Policy
          </Link>
          <Link
            href="/terms-of-service"
            className="text-gray-600 hover:text-gray-900 text-sm"
          >
            Terms of Service
          </Link>
        </div>
      </footer>
    </div>
  );
}
