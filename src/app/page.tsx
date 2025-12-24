/**
 * @author Shiva Nagendra Babu Kore
 */

"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useAuth } from "../contexts/AuthContext";
import { useRouter } from "next/navigation";
import IntercomChat from "../components/IntercomChat";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "../components/ui/accordion";

export default function Home() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [isYearly, setIsYearly] = useState(false);

  // Prevent hydration mismatch by only rendering structured data client-side
  useEffect(() => {
    // Check if we're in the browser environment
    if (typeof window === 'undefined') return;
    
    // Add structured data to head after component mounts
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.innerHTML = JSON.stringify(structuredData);
    document.head.appendChild(script);
    
    // Cleanup function to remove script when component unmounts
    return () => {
      if (document.head.contains(script)) {
        document.head.removeChild(script);
      }
    };
  }, []);

  // Redirect authenticated users to tasks
  useEffect(() => {
    if (!loading && user) {
      router.push("/tasks");
      return;
    }
  }, [user, loading, router]);

  useEffect(() => {
    // Scroll to top on page load/reload
    window.scrollTo(0, 0);

    // Function to center feature image on screen
    const scrollToFeatures = () => {
      const featuresImg = document.getElementById("features");
      if (featuresImg) {
        const rect = featuresImg.getBoundingClientRect();
        const scrollTop =
          window.pageYOffset || document.documentElement.scrollTop;
        const imageTop = rect.top + scrollTop;
        const imageHeight = rect.height;
        const windowHeight = window.innerHeight;

        // Calculate position to center the image
        const centerPosition = imageTop - (windowHeight - imageHeight) / 2;

        window.scrollTo({
          top: centerPosition,
          behavior: "smooth",
        });
      }
    };

    // Add click handler for about/features link
    const handleAboutClick = (e: Event) => {
      e.preventDefault();
      scrollToFeatures();
    };

    // Find and attach event listener to about link
    const aboutLink = document.querySelector('a[href="#features"]');
    if (aboutLink) {
      aboutLink.addEventListener("click", handleAboutClick);
    }

    // Disable right-click context menu
    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
      return false;
    };

    // Disable F12, Ctrl+Shift+I, Ctrl+U, etc.
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.key === "F12" ||
        (e.ctrlKey && e.shiftKey && e.key === "I") ||
        (e.ctrlKey && e.shiftKey && e.key === "C") ||
        (e.ctrlKey && e.key === "u")
      ) {
        e.preventDefault();
        return false;
      }
    };

    document.addEventListener("contextmenu", handleContextMenu);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("contextmenu", handleContextMenu);
      document.removeEventListener("keydown", handleKeyDown);
      // Clean up about link event listener
      if (aboutLink) {
        aboutLink.removeEventListener("click", handleAboutClick);
      }
    };
  }, []);

  // Structured Data for SEO - Only rendered client-side to prevent hydration mismatch
  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebApplication",
        "@id": "https://slane.app/#webapp",
        "name": "Slane",
        "description": "The minimalist task manager designed for solo builders. No teams, no clutter - just one clean list to help you stay in flow.",
        "url": "https://slane.app",
        "applicationCategory": "BusinessApplication",
        "operatingSystem": "Web Browser",
        "offers": [
          {
            "@type": "Offer",
            "name": "Free Plan",
            "price": "0",
            "priceCurrency": "USD",
            "description": "Up to 100 tasks with basic features"
          },
          {
            "@type": "Offer",
            "name": "PRO Plan",
            "price": "29",
            "priceCurrency": "USD",
            "description": "Unlimited tasks with advanced features - lifetime access",
            "priceValidUntil": "2025-12-31"
          }
        ],
        "creator": {
          "@type": "Organization",
          "@id": "https://slane.app/#organization"
        }
      },
      {
        "@type": "Organization",
        "@id": "https://slane.app/#organization",
        "name": "Slane",
        "url": "https://slane.app",
        "logo": {
          "@type": "ImageObject",
          "url": "https://slane.app/Slane.png"
        },
        "sameAs": [
          "https://twitter.com/useslane",
          "https://www.linkedin.com/company/slanehq/"
        ]
      },
      {
        "@type": "WebSite",
        "@id": "https://slane.app/#website",
        "url": "https://slane.app",
        "name": "Slane - The Minimalist Task Manager for Solo Builders",
        "description": "The minimalist task manager designed for solo builders. No teams, no clutter - just one clean list to help you stay in flow.",
        "publisher": {
          "@id": "https://slane.app/#organization"
        }
      }
    ]
  };

  return (
    <div className="min-h-screen bg-white" suppressHydrationWarning>
        {/* Header */}
      <header className="px-4 sm:px-8 py-4 sm:py-6">
        <nav className="flex items-center justify-between">
          <div className="flex items-center space-x-2 sm:space-x-3">
            <Image
              src="/Slane.png"
              alt="Slane Logo"
              width={32}
              height={32}
              className="h-6 w-6 sm:h-8 sm:w-8"
            />
            <div className="text-xl sm:text-2xl font-bold">Slane</div>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex flex-1 justify-center space-x-8">
            <a href="#" className="text-gray-600 hover:text-gray-900">
              Home
            </a>
            <a href="#pricing" className="text-gray-600 hover:text-gray-900">
              Pricing
            </a>
            <a href="#features" className="text-gray-600 hover:text-gray-900">
              About
            </a>
            <a href="#faq" className="text-gray-600 hover:text-gray-900">
              FAQ
            </a>
            <button
              onClick={() => {
                if (window.Intercom) {
                  window.Intercom("show");
                }
              }}
              className="text-gray-600 hover:text-gray-900"
            >
              Support
            </button>
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

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-4 py-8 sm:py-16">
        <div className="text-center">
          <h1 className="text-3xl sm:text-4xl md:text-6xl font-medium text-black mb-4 sm:mb-6 leading-tight">
            The minimalist task
            <br className="hidden sm:block" />
            <span className="sm:hidden"> </span>manager for solo builders.
          </h1>
          <p className="text-lg sm:text-xl text-gray-500 mb-8 sm:mb-12 max-w-2xl mx-auto px-2">
            No teams. No clutter. Just one clean list to help you stay in flow.
          </p>
          <div className="flex justify-center mb-8 sm:mb-16">
            <Link
              href="/signup"
              className="bg-black text-white px-6 py-3 sm:px-4 sm:py-2 rounded-full text-base font-medium hover:bg-gray-800 transition-colors inline-block"
            >
              Get Started
            </Link>
          </div>
        </div>
      </main>

      <Image
        src="/home.png"
        alt="Slane Task Manager Interface"
        width={1200}
        height={800}
        className="w-full max-w-7xl h-auto mx-auto block -mt-8 sm:-mt-16 px-4"
        style={{ filter: "drop-shadow(0 20px 25px rgba(0, 0, 0, 0.15))" }}
      />

      <Image
        id="features"
        src="/Features.png"
        alt="Slane Features"
        width={1200}
        height={800}
        className="w-full max-w-6xl h-auto mx-auto block mt-8 sm:mt-16 px-4"
      />

      {/* Pricing Section */}
      <section id="pricing" className="py-12 sm:py-24 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8 sm:mb-16">
        <h2 className="text-3xl sm:text-4xl font-medium text-black mb-4">
          Pricing
        </h2>
        <p className="text-lg sm:text-xl text-gray-500 mb-8">
          Simple pricing for solo builders
        </p>

        {/* Billing Toggle */}
        <div className="flex items-center justify-center space-x-4 mb-8">
          <span className={`text-sm ${!isYearly ? 'text-black font-medium' : 'text-gray-500'}`}>
            Monthly
          </span>
          <button
            onClick={() => setIsYearly(!isYearly)}
            className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
          isYearly ? 'bg-black' : 'bg-gray-200'
            }`}
          >
            <span
          className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
            isYearly ? 'translate-x-5' : 'translate-x-0'
          }`}
            />
          </button>
          <span className={`text-sm ${isYearly ? 'text-black font-medium' : 'text-gray-500'}`}>
            Yearly
            <span className="ml-1 text-xs text-green-600 font-semibold">Save 18%</span>
          </span>
        </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
        {/* Free Plan */}
        <div className="border border-gray-200 rounded-lg p-4 sm:p-8 flex flex-col h-full">
          <div className="text-center mb-4 sm:mb-6">
            <h3 className="text-xl sm:text-2xl font-bold text-black mb-2">
          Free
            </h3>
            <p className="text-sm text-gray-600 mb-4">For the focused.</p>
            <div className="text-2xl sm:text-3xl font-bold text-black">
          $0
          <span className="text-base sm:text-lg font-normal text-gray-600">
            /month
          </span>
            </div>
          </div>

          <div className="space-y-3 mb-6 flex-grow">
            <div className="flex items-center gap-3">
          <div className="w-5 h-5 rounded-full bg-gray-100 flex items-center justify-center">
            <svg
              className="w-3 h-3 text-black"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <span className="text-sm text-gray-700">Up to 100 tasks</span>
            </div>
            <div className="flex items-center gap-3">
          <div className="w-5 h-5 rounded-full bg-gray-100 flex items-center justify-center">
            <svg
              className="w-3 h-3 text-black"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <span className="text-sm text-gray-700">Offline access</span>
            </div>
            <div className="flex items-center gap-3">
          <div className="w-5 h-5 rounded-full bg-gray-100 flex items-center justify-center">
            <svg
              className="w-3 h-3 text-black"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <span className="text-sm text-gray-700">PWA support</span>
            </div>
            <div className="flex items-center gap-3">
          <div className="w-5 h-5 rounded-full bg-gray-100 flex items-center justify-center">
            <svg
              className="w-3 h-3 text-black"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <span className="text-sm text-gray-700">
            Basic task management
          </span>
            </div>
          </div>

          <div className="mt-auto">
            <Link
          href="/signup"
          className="w-full border border-gray-200 text-black hover:bg-gray-50 py-3 rounded-full font-medium transition-colors inline-block text-center"
            >
          Get Started
            </Link>

            <p className="text-xs text-gray-500 text-center mt-3">
          → No card. No noise. Just start.
            </p>
          </div>
        </div>

        {/* PRO Plan */}
        <div className="border border-gray-200 rounded-lg p-4 sm:p-8 flex flex-col h-full">
          <div className="text-center mb-4 sm:mb-6">
            <h3 className="text-xl sm:text-2xl font-bold text-black mb-2">
          PRO
            </h3>
            <p className="text-sm text-gray-600 mb-4">
          For those who build with intent.
            </p>
            <div className="text-2xl sm:text-3xl font-bold text-black">
          ${isYearly ? '49' : '5'}
          <span className="text-base sm:text-lg font-normal text-gray-600">
            /{isYearly ? 'yearly' : 'monthly'}
          </span>
            </div>
            {isYearly && (
          <p className="text-xs text-green-600 font-medium mt-1">
            Save $11 per year
          </p>
            )}
          </div>

          <div className="space-y-3 mb-6 flex-grow">
            <div className="flex items-center gap-3">
          <div className="w-5 h-5 rounded-full bg-gray-100 flex items-center justify-center">
            <svg
              className="w-3 h-3 text-black"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <span className="text-sm text-gray-700">Unlimited tasks</span>
            </div>
            <div className="flex items-center gap-3">
          <div className="w-5 h-5 rounded-full bg-gray-100 flex items-center justify-center">
            <svg
              className="w-3 h-3 text-black"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <span className="text-sm text-gray-700">Offline access</span>
            </div>
            <div className="flex items-center gap-3">
          <div className="w-5 h-5 rounded-full bg-gray-100 flex items-center justify-center">
            <svg
              className="w-3 h-3 text-black"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <span className="text-sm text-gray-700">
            Power features (shortcuts, filters)
          </span>
            </div>
            <div className="flex items-center gap-3">
          <div className="w-5 h-5 rounded-full bg-gray-100 flex items-center justify-center">
            <svg
              className="w-3 h-3 text-black"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <span className="text-sm text-gray-700">
            Advanced task management
          </span>
            </div>
            <div className="flex items-center gap-3">
          <div className="w-5 h-5 rounded-full bg-gray-100 flex items-center justify-center">
            <svg
              className="w-3 h-3 text-black"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <span className="text-sm text-gray-700">
            Priority updates & support
          </span>
            </div>
          </div>

          <div className="mt-auto">
            <button className="w-full bg-black text-white hover:bg-gray-800 py-3 rounded-full font-medium transition-colors">
          Currently in beta
            </button>

            <p className="text-xs text-gray-500 text-center mt-3">
          → One plan. One price. All in.
            </p>
          </div>
        </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-12 sm:py-24 px-4 bg-white">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8 sm:mb-16">
            <h2 className="text-3xl sm:text-4xl font-medium text-black mb-4">
              FAQ
            </h2>
            <p className="text-lg sm:text-xl text-gray-500">
              Everything you need to know about Slane
            </p>
          </div>
          
          <div className="max-w-3xl mx-auto">
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="item-1" className="border-b border-gray-200">
                <AccordionTrigger className="text-left hover:no-underline py-6 text-lg font-medium text-black">
                  What is Slane?
                </AccordionTrigger>
                <AccordionContent className="text-gray-600 pb-6 text-base leading-relaxed">
                  Slane is a minimalist to-do app built for founders, makers, and deep workers who value clarity over clutter. It&apos;s a simple, fast, and beautifully designed workspace to organize your day without the noise of traditional productivity tools.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-2" className="border-b border-gray-200">
                <AccordionTrigger className="text-left hover:no-underline py-6 text-lg font-medium text-black">
                  How is Slane different from other to-do apps like Notion, Asana, or Linear?
                </AccordionTrigger>
                <AccordionContent className="text-gray-600 pb-6 text-base leading-relaxed">
                  Slane isn&apos;t built for teams or meetings. It&apos;s built for individuals who want to get things done without dashboards, busy UIs, or 20 integrations.
                  <br /><br />
                  No fluff. No notifications overload. Just you, your tasks, and focus.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-3" className="border-b border-gray-200">
                <AccordionTrigger className="text-left hover:no-underline py-6 text-lg font-medium text-black">
                  Who is Slane for?
                </AccordionTrigger>
                <AccordionContent className="text-gray-600 pb-6 text-base leading-relaxed">
                  Founders, indie hackers, designers, developers and anyone who values deep work, simplicity, and design.
                  <br />
                  If you&apos;ve ever felt &quot;tool fatigue,&quot; Slane is your reset button.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-4" className="border-b border-gray-200">
                <AccordionTrigger className="text-left hover:no-underline py-6 text-lg font-medium text-black">
                  Does Slane have AI?
                </AccordionTrigger>
                <AccordionContent className="text-gray-600 pb-6 text-base leading-relaxed">
                  Yes. Slane&apos;s AI helps you create, organize, and prioritize tasks faster.
                  <br />
                  You can describe what you&apos;re working on, and AI will turn that into clear, actionable tasks keeping you in flow instead of planning mode.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-5" className="border-b border-gray-200">
                <AccordionTrigger className="text-left hover:no-underline py-6 text-lg font-medium text-black">
                  Is Slane free?
                </AccordionTrigger>
                <AccordionContent className="text-gray-600 pb-6 text-base leading-relaxed">
                  Yes. Slane is currently free during beta.
                  <br /><br />
                  After beta, there will be a Pro Plan for $5/month and $49/year with unlimited tasks, AI features, and early access to new updates.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-6" className="border-b border-gray-200">
                <AccordionTrigger className="text-left hover:no-underline py-6 text-lg font-medium text-black">
                  Will there be a mobile app?
                </AccordionTrigger>
                <AccordionContent className="text-gray-600 pb-6 text-base leading-relaxed">
                  Slane is a Progressive Web App (PWA) it works perfectly on desktop and mobile browsers. You can install it directly on your home screen and use it offline. A native app may come later.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-7" className="border-b-0">
                <AccordionTrigger className="text-left hover:no-underline py-6 text-lg font-medium text-black">
                  Can I collaborate with others?
                </AccordionTrigger>
                <AccordionContent className="text-gray-600 pb-6 text-base leading-relaxed">
                  Slane is intentionally solo-first designed to improve your personal workflow, not team coordination.
                  <br />
                  We may explore collaborative features later, but only if it doesn&apos;t compromise simplicity.
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        </div>
      </section>

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
      
      {/* Intercom Chat - only for landing page */}
      <IntercomChat />
      </div>
  );
}