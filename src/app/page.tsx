"use client";

import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="border-b border-gray-100 bg-white/95 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-r from-violet-600 to-indigo-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">A</span>
            </div>
            <span className="text-xl font-semibold text-gray-900">Astra</span>
          </div>
          <div className="flex items-center space-x-6">
            <Link
              href="#features"
              className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
            >
              Features
            </Link>
            <Link
              href="/dashboard"
              className="bg-gray-900 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors"
            >
              Try Now
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-6">
        <div className="text-center py-20">
          <div className="inline-flex items-center px-4 py-2 bg-violet-50 border border-violet-200 rounded-full text-sm text-violet-700 mb-8">
            <span className="w-2 h-2 bg-violet-500 rounded-full mr-2"></span>
            Virtual Jewelry Try-On Platform
          </div>

          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
            Try On Jewelry
            <span className="bg-gradient-to-r from-violet-600 to-indigo-600 bg-clip-text text-transparent">
              {" "}
              Virtually
            </span>
          </h1>

          <p className="text-lg text-gray-600 mb-10 max-w-2xl mx-auto">
            Upload your photo, select jewelry, and see how it looks on you with
            AI-powered virtual try-on technology.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
            <Link href="/dashboard">
              <button className="bg-gray-900 text-white px-8 py-3 rounded-lg font-medium hover:bg-gray-800 transition-all shadow-lg hover:shadow-xl">
                Start Virtual Try-On
              </button>
            </Link>
            <button className="text-gray-600 hover:text-gray-900 transition-colors flex items-center space-x-2">
              <span>Watch Demo</span>
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h1m4 0h1m6-4a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </button>
          </div>

          {/* Feature Preview */}
          <div className="bg-gray-50 rounded-2xl p-8 mb-20">
            <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
              <div className="text-center">
                <div className="w-12 h-12 bg-violet-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <svg
                    className="w-6 h-6 text-violet-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">
                  Upload Photos
                </h3>
                <p className="text-sm text-gray-600">
                  Add your model photo and jewelry images
                </p>
              </div>

              <div className="text-center">
                <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <svg
                    className="w-6 h-6 text-indigo-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                    />
                  </svg>
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">
                  AI Processing
                </h3>
                <p className="text-sm text-gray-600">
                  Our AI creates realistic try-on images
                </p>
              </div>

              <div className="text-center">
                <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <svg
                    className="w-6 h-6 text-emerald-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"
                    />
                  </svg>
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">
                  Perfect Result
                </h3>
                <p className="text-sm text-gray-600">
                  Get photorealistic try-on images instantly
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Features Section */}
        <div className="py-20 border-t border-gray-100" id="features">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Why Choose Astra?
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Professional-grade virtual try-on technology powered by advanced
              AI models
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="p-6 rounded-xl border border-gray-100 hover:border-gray-200 transition-colors">
              <div className="w-10 h-10 bg-violet-100 rounded-lg flex items-center justify-center mb-4">
                <svg
                  className="w-5 h-5 text-violet-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 10V3L4 14h7v7l9-11h-7z"
                  />
                </svg>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">
                Ultra-Fast Processing
              </h3>
              <p className="text-sm text-gray-600">
                Generate high-quality try-on images in under 30 seconds
              </p>
            </div>

            <div className="p-6 rounded-xl border border-gray-100 hover:border-gray-200 transition-colors">
              <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center mb-4">
                <svg
                  className="w-5 h-5 text-indigo-600"
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
              <h3 className="font-semibold text-gray-900 mb-2">
                Photorealistic Quality
              </h3>
              <p className="text-sm text-gray-600">
                Studio-grade image quality with perfect lighting and shadows
              </p>
            </div>

            <div className="p-6 rounded-xl border border-gray-100 hover:border-gray-200 transition-colors">
              <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center mb-4">
                <svg
                  className="w-5 h-5 text-emerald-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4"
                  />
                </svg>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">
                Size-Aware Fitting
              </h3>
              <p className="text-sm text-gray-600">
                Accurate sizing based on jewelry dimensions and model
                proportions
              </p>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="py-20 text-center">
          <div className="bg-gradient-to-r from-violet-600 to-indigo-600 rounded-2xl p-12 text-white">
            <h2 className="text-3xl font-bold mb-4">
              Ready to Transform Your Jewelry Experience?
            </h2>
            <p className="text-violet-100 mb-8 max-w-2xl mx-auto">
              Join thousands of jewelry brands and customers who trust Astra for
              virtual try-on solutions.
            </p>
            <Link href="/dashboard">
              <button className="bg-white text-gray-900 px-8 py-3 rounded-lg font-medium hover:bg-gray-100 transition-colors shadow-lg">
                Start Your First Try-On
              </button>
            </Link>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-100 py-12">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <div className="w-6 h-6 bg-gradient-to-r from-violet-600 to-indigo-600 rounded-md flex items-center justify-center">
              <span className="text-white font-bold text-xs">A</span>
            </div>
            <span className="text-lg font-semibold text-gray-900">Astra</span>
          </div>
          <p className="text-sm text-gray-500">
            © 2025 Astra. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
