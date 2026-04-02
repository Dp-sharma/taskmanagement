"use client";
import { useState, useEffect, useRef } from "react";

export default function ChatInterface() {
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState("");
    const [status, setStatus] = useState("idle"); // idle, listening, processing, speaking
    const [recentChats, setRecentChats] = useState([]);
    const [sessionId, setSessionId] = useState("default-session");
    const [isListening, setIsListening] = useState(false);
    
    const [showMemory, setShowMemory] = useState(false);
    const [memories, setMemories] = useState([]);
    
    const recognitionRef = useRef(null);
    const scrollRef = useRef(null);

    // Init Voice & History
    useEffect(() => {
        if (typeof window !== "undefined") {
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            if (SpeechRecognition) {
                const recognition = new SpeechRecognition();
                recognition.continuous = false;
                recognition.lang = "en-US";
                recognition.interimResults = false;

                recognition.onstart = () => setStatus("listening");
                recognition.onresult = (event) => {
                    const text = event.results[0][0].transcript;
                    setInput(text);
                    sendMessage(text);
                };
                recognition.onend = () => {
                    setIsListening(false);
                    if (status === "listening") setStatus("idle");
                };
                recognitionRef.current = recognition;
            }
        }
        fetchHistory();
        fetchMemories();
    }, []);

    const fetchHistory = async () => {
        try {
            const res = await fetch('/api/assistant/history');
            const data = await res.json();
            if (Array.isArray(data)) setRecentChats(data);
        } catch (e) { console.error("Error fetching history", e); }
    };

    const fetchMemories = async () => {
        try {
            const res = await fetch('/api/assistant/memory');
            const data = await res.json();
            if (Array.isArray(data)) setMemories(data);
        } catch (e) { console.error("Error fetching memories", e); }
    };

    // Scroll to bottom
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    const sendMessage = async (text) => {
        const query = text || input;
        if (!query.trim()) return;

        const userMsg = { role: "user", content: query };
        setMessages(prev => [...prev, userMsg]);
        setInput("");
        setStatus("processing");

        try {
            const response = await fetch('/api/assistant', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: query, sessionId }),
            });
            const data = await response.json();
            
            if (data.text) {
                const aiMsg = { role: "assistant", content: data.text };
                setMessages(prev => [...prev, aiMsg]);
                speak(data.text);
            }
        } catch (error) {
            console.error("Chat Error:", error);
        } finally {
            setStatus("idle");
        }
    };

    const speak = (text) => {
        if ('speechSynthesis' in window) {
            setStatus("speaking");
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.onend = () => setStatus("idle");
            window.speechSynthesis.speak(utterance);
        }
    };

    const toggleListening = () => {
        if (isListening) {
            recognitionRef.current?.stop();
            setIsListening(false);
        } else {
            recognitionRef.current?.start();
            setIsListening(true);
        }
    };

    return (
        <div className="flex h-[80vh] w-full max-w-6xl glass rounded-3xl shadow-2xl overflow-hidden border border-white/10 dark:border-white/5">
            {/* Sidebar */}
            <div className="w-64 bg-gray-500/5 border-r border-white/10 p-6 flex flex-col transition-colors duration-300">
                <h2 className="text-xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500">
                    Recent Chats
                </h2>
                <div className="space-y-4 flex-1 overflow-y-auto">
                    {recentChats.map((chat) => (
                        <div key={chat.id} 
                             className="p-3 rounded-xl hover:bg-blue-500/10 cursor-pointer border border-transparent hover:border-blue-500/20 transition-all group">
                            <p className="text-sm font-medium text-foreground/80 group-hover:text-blue-500 transition-colors">{chat.title}</p>
                            <p className="text-xs text-foreground/40 truncate">{chat.lastMsg}</p>
                        </div>
                    ))}
                </div>
                <button className="mt-4 p-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-bold transition-all shadow-lg shadow-blue-600/20">
                    + New Session
                </button>
            </div>

            {/* Chat Area */}
            <div className="flex-1 flex flex-col bg-white/5 dark:bg-black/20">
                {/* Header */}
                <div className="p-6 border-b border-white/10 flex justify-between items-center bg-gray-500/5">
                    <div className="flex items-center gap-3">
                        <div className={`w-3 h-3 rounded-full animate-pulse ${
                            status === 'listening' ? 'bg-red-500' : 
                            status === 'processing' ? 'bg-amber-500' : 
                            status === 'speaking' ? 'bg-green-500' : 'bg-blue-500'
                        }`} />
                        <h1 className="text-lg font-semibold uppercase tracking-widest text-foreground/70">Jarvis</h1>
                    </div>
                    <div className="flex items-center gap-4">
                        <button 
                            onClick={() => setShowMemory(!showMemory)}
                            className={`text-xs font-mono px-3 py-1 rounded-full border transition-all ${
                                showMemory 
                                ? 'bg-purple-500 text-white border-purple-500 shadow-lg shadow-purple-500/20' 
                                : 'bg-gray-500/10 border-white/10 text-foreground/50 hover:text-foreground/80'
                            }`}>
                            {showMemory ? 'Close Memory' : 'View Memory'}
                        </button>
                        <div className="text-xs text-foreground/40 italic">
                            {status === 'listening' ? 'Listening to Boss...' : 
                             status === 'processing' ? 'Thinking...' : 
                             status === 'speaking' ? 'Speaking...' : 'Ready'}
                        </div>
                    </div>
                </div>

                {/* Messages / Memory Overlay */}
                <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-6 relative">
                    {showMemory ? (
                        <div className="absolute inset-0 z-10 bg-background/95 backdrop-blur-md p-8 animate-in slide-in-from-top duration-300 overflow-y-auto">
                            <h3 className="text-xl font-bold mb-6 text-purple-500 flex items-center gap-2">
                                🧠 Persistent Cognitive Memory
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {memories.map((m, i) => (
                                    <div key={i} className="p-4 rounded-3xl bg-gray-500/5 border border-white/10 group hover:border-purple-500/50 transition-all">
                                        <p className="text-xs font-mono text-purple-500 uppercase mb-1 font-bold">{m.key}</p>
                                        <p className="text-foreground/80">{m.value}</p>
                                        <p className="text-[10px] text-foreground/30 mt-2 font-mono uppercase tracking-widest">Synced: {new Date(m.lastUpdated).toLocaleDateString()}</p>
                                    </div>
                                ))}
                                {memories.length === 0 && (
                                    <p className="text-foreground/40 italic text-center col-span-full mt-20">No data in neural core yet.</p>
                                )}
                            </div>
                        </div>
                    ) : null}

                    {messages.length === 0 && !showMemory && (
                        <div className="h-full flex flex-col items-center justify-center text-center opacity-30">
                            <span className="text-6xl mb-4">🤖</span>
                            <p className="text-xl font-bold uppercase tracking-tighter">Standby Protocol Active</p>
                            <p className="text-sm mt-2">Awaiting your command, Boss.</p>
                        </div>
                    )}
                    {messages.map((msg, i) => (
                        <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-[80%] p-4 rounded-3xl shadow-lg transition-all ${
                                msg.role === 'user' 
                                ? 'bg-blue-600 text-white shadow-blue-600/20' 
                                : 'glass text-foreground shadow-black/5'
                            }`}>
                                {msg.content}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Input */}
                <div className="p-6 bg-gray-500/5 border-t border-white/10">
                    <div className="relative flex items-center gap-4">
                        <input 
                            type="text" 
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                            placeholder="Type a message or use voice..."
                            className="flex-1 bg-white/5 dark:bg-white/5 border border-white/10 rounded-2xl py-4 px-6 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all placeholder:text-foreground/20 text-foreground"
                        />
                        <button 
                            onClick={toggleListening}
                            className={`p-4 rounded-2xl transition-all shadow-lg ${
                                isListening 
                                ? 'bg-red-500 text-white shadow-red-500/20 scale-110' 
                                : 'bg-blue-500/10 text-blue-500 hover:bg-blue-500/20 border border-blue-500/20'
                            }`}>
                            {isListening ? '🛑' : '🎙️'}
                        </button>
                        <button 
                            onClick={() => sendMessage()}
                            className="p-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-2xl hover:scale-105 active:scale-95 transition-all shadow-xl shadow-blue-600/20">
                            🚀
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
