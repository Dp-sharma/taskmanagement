"use client";
import ChatInterface from "@/components/ChatInterface";

export default function AssistantPage() {
    return (
        <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-4 md:p-8">
            <div className="max-w-7xl w-full space-y-8 animate-in fade-in duration-1000">
                <div className="text-center space-y-2">
                    <h1 className="text-4xl md:text-6xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 tracking-tighter">
                        JARVIS PROTOCOL
                    </h1>
                    <p className="text-gray-500 font-mono text-sm uppercase tracking-widest">
                        Neural Interface • Autonomous Assistant • Deepansh Sharma
                    </p>
                </div>

                <div className="flex justify-center w-full">
                    <ChatInterface />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center text-xs text-gray-600 font-mono uppercase tracking-widest">
                    <div className="p-4 rounded-2xl border border-white/5 bg-white/5">
                        <span className="text-blue-500 mr-2">CORE:</span> LangGraph 2.0
                    </div>
                    <div className="p-4 rounded-2xl border border-white/5 bg-white/5">
                        <span className="text-purple-500 mr-2">STATE:</span> Persistent Memory
                    </div>
                    <div className="p-4 rounded-2xl border border-white/5 bg-white/5">
                        <span className="text-pink-500 mr-2">AUTH:</span> Boss Level 1
                    </div>
                </div>
            </div>
        </div>
    );
}
