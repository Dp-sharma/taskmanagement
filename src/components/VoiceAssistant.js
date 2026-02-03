"use client";
import { useState, useEffect, useRef } from "react";

export default function VoiceAssistant() {
    const [isSessionActive, setIsSessionActive] = useState(false);
    const [status, setStatus] = useState("idle"); // idle, listening, processing, speaking
    const [isMounted, setIsMounted] = useState(false);

    // Refs for stable access in callbacks
    const recognitionRef = useRef(null);
    const isSessionActiveRef = useRef(false);

    useEffect(() => {
        setIsMounted(true);
        if (typeof window !== "undefined") {
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            if (SpeechRecognition) {
                const recognition = new SpeechRecognition();
                recognition.continuous = false;
                recognition.lang = "en-US";
                recognition.interimResults = false;

                recognition.onstart = () => {
                    setStatus("listening");
                };

                recognition.onend = () => {
                    // Handled manually in toggle/speak logic
                };

                recognition.onerror = (event) => {
                    console.error("Speech error", event);
                    if (event.error === 'no-speech' && isSessionActiveRef.current) {
                        // Optional: could restart here, but for now we stop to avoid infinite loops if silence
                        setStatus("idle");
                        setIsSessionActive(false);
                        isSessionActiveRef.current = false;
                    } else {
                        setStatus("idle");
                        setIsSessionActive(false);
                        isSessionActiveRef.current = false;
                    }
                };

                recognition.onresult = async (event) => {
                    const text = event.results[0][0].transcript;
                    console.log("Heard:", text);
                    await handleCommand(text);
                };

                recognitionRef.current = recognition;
            } else {
                console.warn("Web Speech API not supported.");
            }
        }
    }, []);

    // Sync ref
    useEffect(() => {
        isSessionActiveRef.current = isSessionActive;
    }, [isSessionActive]);

    const speak = (text) => {
        if ('speechSynthesis' in window) {
            setStatus("speaking");
            window.speechSynthesis.cancel();

            const utterance = new SpeechSynthesisUtterance(text);
            const voices = window.speechSynthesis.getVoices();
            const preferredVoice = voices.find(v => v.name.includes("Google US English")) || voices[0];
            if (preferredVoice) utterance.voice = preferredVoice;

            utterance.rate = 1.1;
            utterance.pitch = 1.0;

            utterance.onend = () => {
                if (isSessionActiveRef.current) {
                    try {
                        recognitionRef.current.start();
                    } catch (e) {
                        console.error("Restart error:", e);
                        setStatus("idle");
                        setIsSessionActive(false);
                    }
                } else {
                    setStatus("idle");
                }
            };

            utterance.onerror = () => {
                setStatus("idle");
                setIsSessionActive(false);
            };

            window.speechSynthesis.speak(utterance);
        }
    };

    const handleCommand = async (text) => {
        setStatus("processing");

        const lowerText = text.toLowerCase();
        if (lowerText.includes("stop conversation") || lowerText.includes("stop listening") || lowerText.includes("goodbye") || lowerText.includes("end chat")) {
            setIsSessionActive(false);
            isSessionActiveRef.current = false;
            speak("Goodbye, Boss.");
            return;
        }

        try {
            const response = await fetch('/api/assistant', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userQuery: text,
                    sessionId: "user-session-1"
                }),
            });

            const data = await response.json();
            if (data.text) {
                speak(data.text);
            } else if (data.error) {
                speak("I encountered an error.");
            } else {
                speak("I didn't catch that.");
            }
        } catch (error) {
            speak("Connection error.");
        }
    };

    const toggleSession = () => {
        if (!recognitionRef.current) return;

        if (isSessionActive) {
            setIsSessionActive(false);
            isSessionActiveRef.current = false;
            recognitionRef.current.stop();
            window.speechSynthesis.cancel();
            setStatus("idle");
        } else {
            setIsSessionActive(true);
            isSessionActiveRef.current = true;
            try {
                recognitionRef.current.start();
            } catch (e) {
                console.error("Start error:", e);
            }
        }
    };

    if (!isMounted || !recognitionRef.current) return null;

    // --- Futuristic Visuals ---
    return (
        <div className="fixed bottom-8 right-8 z-[100] flex items-center justify-center">
            {/* Main Interactive Container */}
            <div
                onClick={toggleSession}
                className="relative flex items-center justify-center w-24 h-24 cursor-pointer group transition-transform duration-500 hover:scale-110"
                title={isSessionActive ? "Stop Jarvis" : "Activate Jarvis"}
            >
                {/* 1. Outer Glow Ring (Static/Breathing) */}
                <div className={`absolute inset-0 rounded-full blur-xl transition-all duration-700 opacity-60
                    ${status === 'idle' ? 'bg-cyan-500/30' :
                        status === 'listening' ? 'bg-red-500/50 scale-125' :
                            status === 'processing' ? 'bg-amber-400/50 scale-110' :
                                'bg-green-400/50 scale-125'}`}
                />

                {/* 2. Rotating Reactor Core (Processing) */}
                <div className={`absolute inset-0 rounded-full border-2 border-dashed border-cyan-400/50 transition-all duration-1000
                    ${status === 'processing' ? 'animate-[spin_2s_linear_infinite] opacity-100' : 'opacity-0'}`}
                />

                {/* 3. Ripple Waves (Listening) */}
                <div className={`absolute inset-0 rounded-full border border-red-500/50 transition-all duration-300
                    ${status === 'listening' ? 'animate-[ping_1.5s_cubic-bezier(0,0,0.2,1)_infinite] opacity-100' : 'opacity-0'}`}
                />
                <div className={`absolute inset-2 rounded-full border border-red-500/30 transition-all duration-300 delay-100
                    ${status === 'listening' ? 'animate-[ping_1.5s_cubic-bezier(0,0,0.2,1)_infinite] opacity-100' : 'opacity-0'}`}
                />

                {/* 4. Speaking Pulse (Speaking) */}
                <div className={`absolute inset-0 flex items-center justify-center gap-1 transition-all duration-300
                    ${status === 'speaking' ? 'opacity-100' : 'opacity-0'}`}>
                    <div className="w-1 h-4 bg-green-400 animate-[pulse_0.5s_ease-in-out_infinite]" style={{ animationDelay: '0ms' }}></div>
                    <div className="w-1 h-6 bg-green-400 animate-[pulse_0.5s_ease-in-out_infinite]" style={{ animationDelay: '100ms' }}></div>
                    <div className="w-1 h-3 bg-green-400 animate-[pulse_0.5s_ease-in-out_infinite]" style={{ animationDelay: '200ms' }}></div>
                </div>

                {/* 5. Central Orb (The "Eye") */}
                <div className={`relative w-16 h-16 rounded-full shadow-[inset_0_2px_15px_rgba(0,0,0,0.5)] flex items-center justify-center overflow-hidden backdrop-blur-sm border transition-all duration-500
                    ${status === 'idle' ? 'bg-cyan-900/80 border-cyan-400/50 shadow-[0_0_20px_cyan]' :
                        status === 'listening' ? 'bg-red-900/80 border-red-500 shadow-[0_0_30px_red]' :
                            status === 'processing' ? 'bg-amber-900/80 border-amber-400 shadow-[0_0_30px_orange]' :
                                'bg-green-900/80 border-green-400 shadow-[0_0_30px_green]'}`}
                >
                    {/* Inner Core Gradient */}
                    <div className={`absolute w-full h-full bg-gradient-to-tr from-transparent via-white/10 to-transparent opacity-50`} />

                    {/* Icon / Central Visual */}
                    {status === 'idle' && (
                        <div className="w-3 h-3 bg-cyan-400 rounded-full shadow-[0_0_10px_cyan] animate-pulse" />
                    )}
                    {status === 'processing' && (
                        <div className="w-8 h-8 rounded-full border-t-2 border-b-2 border-amber-400 animate-spin" />
                    )}
                </div>
            </div>

            {/* Status Label (Optional, nice for feedback) */}
            <div className={`absolute -top-8 bg-black/80 text-white text-xs px-3 py-1 rounded-full backdrop-blur-md border border-white/10 transition-all duration-300 pointer-events-none whitespace-nowrap
                ${isSessionActive ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'}`}>
                {status === 'idle' ? 'Jarvis Active' :
                    status === 'listening' ? 'Listening...' :
                        status === 'processing' ? 'Processing...' :
                            'Speaking...'}
            </div>
        </div>
    );
}
