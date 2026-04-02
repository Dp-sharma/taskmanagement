"use client";
import Link from 'next/link';

export default function LandingPage() {
  return (
    <div className="relative min-h-screen flex items-center justify-center p-4 overflow-hidden bg-white dark:bg-black transition-colors duration-500">
      {/* Dynamic Background Elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-500/10 rounded-full blur-[120px] animate-pulse" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-500/10 rounded-full blur-[120px] animate-pulse delay-700" />
      
      {/* Grid Pattern Overlay */}
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none" />

      {/* Main Content Card */}
      <div className="relative z-10 w-full max-w-3xl glass rounded-3xl p-8 md:p-16 space-y-8 text-center animate-fade-in shadow-2xl">
        <div className="inline-block p-3 rounded-2xl bg-blue-500/10 mb-4">
          <span className="text-[10px] font-black uppercase tracking-[0.3em] text-blue-500">
            Internal Systems v3.0
          </span>
        </div>

        <h1 className="text-5xl md:text-8xl font-black tracking-tighter leading-none bg-clip-text text-transparent bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600">
          The JARVIS Protocol
        </h1>

        <p className="text-lg md:text-xl text-gray-500 dark:text-gray-400 font-medium max-w-xl mx-auto leading-relaxed">
          The next evolution of shared intelligence. Organize tasks, manage leads, and interact with a persistent AI assistant in a unified neural environment.
        </p>

        <div className="pt-8 flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Link href="/login" passHref>
            <button className="px-10 py-4 text-sm font-black uppercase tracking-widest text-white bg-blue-600 rounded-2xl shadow-lg shadow-blue-600/30 transition-all hover:scale-105 active:scale-95 hover:bg-blue-500">
              Initiate Login
            </button>
          </Link>
          <Link href="/assistant" passHref>
            <button className="px-10 py-4 text-sm font-black uppercase tracking-widest text-gray-500 glass rounded-2xl transition-all hover:bg-white/10 hover:text-white">
              System Overview
            </button>
          </Link>
        </div>

        {/* Footer Meta */}
        <div className="pt-12 flex justify-center gap-6 text-[10px] uppercase font-mono tracking-widest text-gray-500 opacity-50">
          <span>Neural Link 100%</span>
          <span>Encrypted Session</span>
          <span>Boss Auth Only</span>
        </div>
      </div>

      <style jsx global>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fadeIn 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
      `}</style>
    </div>
  );
}