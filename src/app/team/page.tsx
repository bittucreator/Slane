/**
 * @author Shiva Nagendra Babu Kore
 */

"use client";

import Link from "next/link";
import Image from "next/image";

export default function Team() {
  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="px-4 sm:px-8 py-4 sm:py-6">
        <nav className="flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-2 sm:space-x-3">
            <Image
              src="/Slane.png"
              alt="Slane Logo"
              width={32}
              height={32}
              className="h-6 w-6 sm:h-8 sm:w-8"
            />
            <div className="text-xl sm:text-2xl font-bold">Slane</div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex flex-1 justify-center space-x-8">
            <Link href="/" className="text-gray-600 hover:text-gray-900">
              Home
            </Link>
            <a href="/#pricing" className="text-gray-600 hover:text-gray-900">
              Pricing
            </a>
            <a href="/#features" className="text-gray-600 hover:text-gray-900">
              About
            </a>
            <a href="/#support" className="text-gray-600 hover:text-gray-900">
              Support
            </a>
          </div>

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
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <div className="text-center mb-12 mt-12 sm:mt-16">
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-medium text-black mb-3 sm:mb-4 leading-tight">
            Meet Our Team
          </h1>
          <p className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            We are dedicated to building the best task management experience.
          </p>
        </div>

        {/* Team Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {/* Team Member 1 */}
          <div className="text-center">
            <div className="w-32 h-32 bg-gray-200 rounded-full mx-auto mb-4 flex items-center justify-center overflow-hidden">
              <Image
                src="https://media.licdn.com/dms/image/v2/D4E03AQF--e0QGK0pLg/profile-displayphoto-shrink_400_400/B4EZUxgqyJHgAg-/0/1740292402678?e=1761782400&v=beta&t=JIzI1dSBar3rsI-VpeEDBPtLpmo7zzjZMohQn-VOlyM"
                alt="Shiva Nagendra Kore"
                width={128}
                height={128}
                className="w-32 h-32 object-cover rounded-full"
              />
            </div>
            <h3 className="text-xl font-semibold text-black mb-2">
              Shiva Nagendra Kore
            </h3>
            <p className="text-gray-600 mb-2">Developer</p>
            <div className="flex justify-center space-x-3 mt-3">
              <a
                href="https://www.linkedin.com/in/shivanagendrak/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg
                  className="w-5 h-5"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                </svg>
              </a>
              <a
                href="https://x.com/k_shivanagendra"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg
                  className="w-5 h-5"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
              </a>
            </div>
          </div>

          {/* Team Member 2 */}
          <div className="text-center">
            <div className="w-32 h-32 bg-gray-200 rounded-full mx-auto mb-4 flex items-center justify-center overflow-hidden">
              <Image
                src="https://media.licdn.com/dms/image/v2/D5603AQEZycy6JodzCA/profile-displayphoto-shrink_400_400/B56ZRQqGa2HoAg-/0/1736520001652?e=1761782400&v=beta&t=GFw_1zDDXBivHVqZk-nKaOcTOn6vYJmEnwnIhSYRAsQ"
                alt="Venkat Nangedda"
                width={128}
                height={128}
                className="w-32 h-32 object-cover rounded-full"
              />
            </div>
            <h3 className="text-xl font-semibold text-black mb-2">
              Venkat Nangedda
            </h3>
            <p className="text-gray-600 mb-2">Designer</p>
            <div className="flex justify-center space-x-3 mt-3">
              <a
                href="https://www.linkedin.com/in/nangeddavenkat/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg
                  className="w-5 h-5"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                </svg>
              </a>
              <a
                href="https://x.com/bittucreator"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg
                  className="w-5 h-5"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.80l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
              </a>
            </div>
          </div>

          {/* Team Member 3 */}
          <div className="text-center">
            <div className="w-32 h-32 bg-gray-200 rounded-full mx-auto mb-4 flex items-center justify-center overflow-hidden">
              <Image
                src="/Praneeth_Narisetty.png"
                alt="Praneeth Narisetty"
                width={128}
                height={128}
                className="w-32 h-32 object-cover rounded-full"
              />
            </div>
            <h3 className="text-xl font-semibold text-black mb-2">
              Praneeth Narisetty
            </h3>
            <p className="text-gray-600 mb-2">Developer</p>
            <div className="flex justify-center space-x-3 mt-3">
              <a
                href="https://linkedin.com/in/praneethnarisetty"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg
                  className="w-5 h-5"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                </svg>
              </a>
              <a
                href="https://x.com/AskPraneeth"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg
                  className="w-5 h-5"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.80l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
              </a>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
