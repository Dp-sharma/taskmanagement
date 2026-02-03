"use client";
import { useState, useEffect, useRef } from "react";

export default function VoiceAssistant() {
    const [isListening, setIsListening] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [isSpeaking, setIsSpeaking] = useState(false);

    const [isMounted, setIsMounted] = useState(false);
    const recognitionRef = useRef(null);

    useEffect(() => {
        setIsMounted(true);
        if (typeof window !== "undefined") {
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            if (SpeechRecognition) {
                const recognition = new SpeechRecognition();
                recognition.continuous = false; // Stop after one sentence/command
                recognition.lang = "en-US";
                recognition.interimResults = false;

                recognition.onstart = () => setIsListening(true);
                recognition.onend = () => setIsListening(false);
                recognition.onerror = (event) => {
                    console.error("Speech error", event);
                    setIsListening(false);
                };

                recognition.onresult = async (event) => {
                    const text = event.results[0][0].transcript;
                    console.log("Heard:", text);
                    await handleCommand(text);
                };

                recognitionRef.current = recognition;
            } else {
                console.warn("Web Speech API not supported in this browser.");
            }
        }
    }, []);

    const speak = (text) => {
        if ('speechSynthesis' in window) {
            setIsSpeaking(true);
            window.speechSynthesis.cancel();

            const utterance = new SpeechSynthesisUtterance(text);
            const voices = window.speechSynthesis.getVoices();
            const preferredVoice = voices.find(v => v.name.includes("Google US English")) || voices[0];
            if (preferredVoice) utterance.voice = preferredVoice;

            utterance.rate = 1.1; // Slightly faster for assistant feel
            utterance.pitch = 1.0;

            utterance.onend = () => setIsSpeaking(false);
            utterance.onerror = () => setIsSpeaking(false);

            window.speechSynthesis.speak(utterance);
        }
    };

    const handleCommand = async (text) => {
        setIsProcessing(true);
        try {
            // Using the updated API expectation
            const response = await fetch('/api/assistant', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userQuery: text, // New key expected by updated backend
                    sessionId: "user-session-1" // Simple session ID
                }),
            });

            const data = await response.json();
            if (data.responseText) {
                speak(data.responseText);
            } else if (data.text) {
                speak(data.text);
            } else if (data.error) {
                console.error(data.error);
                speak("Sorry, something went wrong.");
            }
        } catch (error) {
            console.error(error);
            speak("I'm having trouble connecting.");
        } finally {
            setIsProcessing(false);
        }
    };

    const toggleListening = () => {
        if (!recognitionRef.current) return;

        if (isListening) {
            recognitionRef.current.stop();
        } else {
            recognitionRef.current.start();
        }
    };

    // Wait until mounted to avoid hydration mismatch, and ensure we show something even if not supported (optional: show error)
    if (!isMounted) return null;

    // Check availability only when user interacts if you want, or just disable button.
    // For now, if not supported, we can hide or show disabled. 
    // Let's hide if strictly not supported, BUT we need to check window again or use a state.
    // Simplifying: If recognitionRef is null after mount, it means not supported.

    // However, since we want to show it now:
    if (!recognitionRef.current) {
        // Fallback or hidden if truly not supported? 
        // Let's render it but maybe with a visual cue or just start ensuring it renders.
        // Actually, if we return null here, same problem.
        // BUT, since we set state `setIsMounted(true)` inside useEffect, it WILL re-render.
        // And inside that re-render, recognitionRef.current SHOULD be set if supported.
    }

    if (!recognitionRef.current) return null;

    return (
        <div className="fixed bottom-6 right-6 z-50">

            <button
                onClick={toggleListening}
                className={`p-4 rounded-full shadow-xl transition-all duration-300 transform hover:scale-105 flex items-center justify-center border-4 ${isListening ? 'bg-red-500 border-red-300 animate-pulse' :
                    isProcessing ? 'bg-yellow-500 border-yellow-300' :
                        isSpeaking ? 'bg-green-500 border-green-300' : 'bg-blue-600 border-blue-400'
                    } text-white`}
                title={isListening ? "Listening..." : "Click to Speak"}
            >
                {isListening ? (
                    // Stop/Mic active icon
                    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" /><path d="M19 10v2a7 7 0 0 1-14 0v-2" /><line x1="12" x2="12" y1="19" y2="22" /></svg>
                ) : isProcessing ? (
                    // Processing/Loading
                    <svg className="animate-spin" xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12a9 9 0 1 1-6.219-8.56" /></svg>
                ) : isSpeaking ? (
                    // Speaker icon
                    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" /><path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07" /></svg>
                ) : (
                    // Default Mic icon
                    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" /><path d="M19 10v2a7 7 0 0 1-14 0v-2" /><line x1="12" x2="12" y1="19" y2="22" /></svg>
                )}
            </button>
        </div>
    );
}
