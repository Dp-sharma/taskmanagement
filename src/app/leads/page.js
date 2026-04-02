"use client";
import { useState, useEffect } from "react";

export default function LeadsPage() {
    const [leads, setLeads] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchLeads();
    }, []);

    const fetchLeads = async () => {
        try {
            const res = await fetch('/api/leads');
            const data = await res.json();
            setLeads(data);
        } catch (e) {
            console.error("Error fetching leads", e);
        } finally {
            setLoading(false);
        }
    };

    const updateStage = async (id, newStage) => {
        try {
            await fetch(`/api/leads/${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ stage: newStage }),
            });
            fetchLeads();
        } catch (e) {
            console.error("Error updating stage", e);
        }
    };

    const stages = ['Pitching', 'Installation', 'Training', 'Performance tracing', 'General', 'Onboarded', 'Inactive'];

    return (
        <div className="p-4 md:p-8 transition-colors duration-300">
            <div className="max-w-6xl mx-auto space-y-10">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-end border-b border-white/10 pb-8 gap-4">
                    <div>
                        <h1 className="text-4xl md:text-5xl font-black bg-clip-text text-transparent bg-gradient-to-r from-green-500 to-blue-600">
                            Lead Management
                        </h1>
                        <p className="text-gray-500 font-mono text-xs mt-2 uppercase tracking-widest">Neural School Onboarding Pipeline</p>
                    </div>
                    <div className="text-left md:text-right glass px-6 py-4 rounded-3xl">
                        <p className="text-4xl font-black text-blue-500">{leads.length}</p>
                        <p className="text-[10px] text-gray-500 uppercase font-mono tracking-widest font-bold">Active Protocols</p>
                    </div>
                </div>

                {loading ? (
                    <div className="h-64 flex items-center justify-center">
                        <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {leads.map((lead) => (
                            <div key={lead._id} className="glass rounded-3xl p-8 hover:scale-[1.03] hover:border-blue-500/50 transition-all group relative overflow-hidden shadow-xl shadow-black/5">
                                <div className="flex justify-between items-start mb-6">
                                    <h3 className="text-xl font-bold text-foreground/80 group-hover:text-blue-500 transition-colors">
                                        {lead.name}
                                    </h3>
                                    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                                        lead.stage === 'Pitching' ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20' :
                                        lead.stage === 'Onboarded' ? 'bg-green-500/10 text-green-500 border border-green-500/20' :
                                        'bg-blue-500/10 text-blue-500 border border-blue-500/20'
                                    }`}>
                                        {lead.stage}
                                    </span>
                                </div>
                                
                                <div className="space-y-6">
                                    <div className="text-xs text-foreground/40 font-medium space-y-2">
                                        <p className="flex items-center gap-2">📍 {lead.address || 'Location Unknown'}</p>
                                        <p className="flex items-center gap-2">👤 {lead.contactPerson || 'No Contact Data'}</p>
                                    </div>

                                    <div className="pt-6 border-t border-white/10">
                                        <label className="text-[10px] text-gray-400 font-black uppercase tracking-widest block mb-3">Update Mission Stage</label>
                                        <select 
                                            value={lead.stage}
                                            onChange={(e) => updateStage(lead._id, e.target.value)}
                                            className="w-full bg-white/5 dark:bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all font-bold"
                                        >
                                            {stages.map(s => <option key={s} value={s} className="bg-background text-foreground">{s}</option>)}
                                        </select>
                                    </div>
                                </div>
                                {/* Decorative gradient corner */}
                                <div className="absolute -top-10 -right-10 w-20 h-20 bg-blue-500/5 rounded-full blur-[40px] group-hover:bg-blue-500/10 transition-all" />
                            </div>
                        ))}
                        {leads.length === 0 && (
                            <div className="col-span-full h-80 flex flex-col items-center justify-center glass rounded-3xl text-gray-500 border-2 border-dashed border-white/20">
                                <div className="text-4xl mb-4 opacity-50">📂</div>
                                <p className="text-xl font-bold uppercase tracking-tighter">System Empty</p>
                                <p className="text-sm font-medium mt-2">Initialize a lead protocol via JARVIS assistant.</p>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
