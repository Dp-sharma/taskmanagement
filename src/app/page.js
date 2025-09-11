'use client'
import Link from 'next/link';

export default function LandingPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      {/* Background with subtle gradient */}
      <div className="absolute inset-0 bg-gray-950">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900 via-gray-950 to-purple-900 opacity-20 animate-bg-pulse"></div>
      </div>

      {/* Main Content Card with frosted glass effect */}
      <div className="relative z-10 w-full max-w-2xl backdrop-filter backdrop-blur-lg bg-white/10 border border-white/20 rounded-2xl shadow-2xl p-8 space-y-8 text-center text-white transform transition-transform duration-500 ease-in-out hover:scale-105">
        <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 drop-shadow-lg">
          Team Update Tracker
        </h1>
        <p className="text-lg md:text-xl text-gray-300 leading-relaxed max-w-xl mx-auto">
          Elevate your teams workflow with a simple, powerful, and collaborative update tracking system. Organize tasks, monitor progress, and get things done—together.
        </p>
        <div className="pt-4">
          <Link href="/login" passHref>
            <button
              className="inline-flex items-center justify-center px-10 py-4 text-lg font-bold text-white bg-blue-600 rounded-full shadow-lg transition-all duration-300 transform hover:scale-110 hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-500 focus:ring-opacity-50"
            >
              Start Tracking Now
            </button>
          </Link>
        </div>
      </div>

      {/* Tailwind CSS keyframes for animation */}
      <style jsx global>{`
        @keyframes bg-pulse {
          0% {
            transform: scale(0.6);
          }
          50% {
            transform: scale(0.99);
          }
          100% {
            transform: scale(0.8);
          }
        }
        .animate-bg-pulse {
          animation: bg-pulse 20s infinite ease-in-out;
        }
      `}</style>
    </div>
  );
}