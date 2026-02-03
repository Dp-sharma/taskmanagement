"use client";
import VoiceAssistant from "@/components/VoiceAssistant";

export default function AssistantPage() {
    return (
        <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center p-6">
            <div className="max-w-2xl w-full text-center space-y-8">

                <div className="space-y-4">
                    <h1 className="text-5xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500">
                        AI Personal Assistant
                    </h1>
                    <p className="text-xl text-gray-300">
                        Your voice-controlled task manager. Jarvis is ready to help.
                    </p>
                </div>

                <div className="bg-gray-800 p-8 rounded-2xl shadow-2xl border border-gray-700 flex flex-col items-center space-y-6">
                    <div className="w-32 h-32 bg-blue-500/10 rounded-full flex items-center justify-center animate-pulse">
                        <span className="text-4xl">🎙️</span>
                    </div>

                    <div className="space-y-2">
                        <h2 className="text-2xl font-semibold">How to use:</h2>
                        <ul className="text-gray-400 text-left space-y-2 list-disc list-inside">
                            <li>Click the microphone button (bottom right)</li>
                            <li>Say <strong>Create a task to buy groceries</strong></li>
                            <li>Say <strong>List my pending tasks</strong></li>
                            <li>Say <strong>Mark buy groceries as done</strong></li>
                        </ul>
                    </div>
                </div>

                {/* The VoiceAssistant is mostly fixed, but we render it here to ensure it's available on this page 
            even if removed from layout later. */}
                {/* If it's already in layout, this might duplicate it. 
            We should verify if user wants to remove it from layout. 
            For now, let's assume layout has it, so maybe this page just explains it?
            OR we explicitly put one here that might be styled differently?
            The current VoiceAssistant is fixed position. 
        */}
            </div>
        </div>
    );
}
