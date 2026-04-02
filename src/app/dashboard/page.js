"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { CheckSquare, Users, MessageSquareCode, TrendingUp, Clock, Zap } from "lucide-react";

export default function Dashboard() {
  const [stats, setStats] = useState({
    tasks: 0,
    leads: 0,
    memories: 0,
  });
  const [user, setUser] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch User Profile
        const profileRes = await fetch("/api/profile");
        if (profileRes.ok) {
          const profileData = await profileRes.json();
          setUser(profileData.user);
        }

        // Fetch Stats (Tasks)
        const tasksRes = await fetch("/api/tasks");
        if (tasksRes.ok) {
          const tasksData = await tasksRes.json();
          setStats(prev => ({ ...prev, tasks: tasksData.length }));
        }

        // Fetch Stats (Leads)
        const leadsRes = await fetch("/api/leads");
        if (leadsRes.ok) {
          const leadsData = await leadsRes.json();
          setStats(prev => ({ ...prev, leads: leadsData.length }));
        }

        // Fetch Stats (Memories)
        const memoryRes = await fetch("/api/assistant/memory");
        if (memoryRes.ok) {
          const memoryData = await memoryRes.json();
          setStats(prev => ({ ...prev, memories: memoryData.length }));
        }
      } catch (err) {
        console.error("Dashboard fetch error:", err);
      }
    };
    fetchData();
  }, []);

  const quickActions = [
    { name: "Manage Tasks", href: "/app", icon: CheckSquare, color: "text-blue-500", bg: "bg-blue-500/10" },
    { name: "Talk to JARVIS", href: "/assistant", icon: MessageSquareCode, color: "text-purple-500", bg: "bg-purple-500/10" },
    { name: "Lead Pipeline", href: "/leads", icon: Users, color: "text-green-500", bg: "bg-green-500/10" },
  ];

  return (
    <div className="space-y-10 max-w-6xl mx-auto">
      {/* Welcome Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-4xl font-black bg-clip-text text-transparent bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 tracking-tighter">
            Dashboard
          </h1>
          <p className="text-gray-500 font-medium mt-1">
            Welcome back, <span className="text-blue-500 font-bold">{user || "Boss"}</span>. Here's your mission overview.
          </p>
        </div>
        <div className="glass px-4 py-2 rounded-2xl flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-gray-500">
          <Zap className="w-4 h-4 text-yellow-500 animate-pulse" />
          Neural Link: Online
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { label: "Active Tasks", value: stats.tasks, icon: CheckSquare, color: "text-blue-500", trend: "+2 this week" },
          { label: "Total Leads", value: stats.leads, icon: Users, color: "text-green-500", trend: "+5 new leads" },
          { label: "AI Insights", value: stats.memories, icon: MessageSquareCode, color: "text-purple-500", trend: "Context Sync Active" },
        ].map((stat, i) => (
          <div key={i} className="glass p-6 rounded-3xl group hover:scale-[1.02] transition-all duration-300">
            <div className="flex justify-between items-start">
              <div className={`p-3 rounded-2xl bg-gray-500/5 ${stat.color}`}>
                <stat.icon className="w-6 h-6" />
              </div>
              <div className="text-[10px] uppercase font-bold text-gray-500 tracking-widest">{stat.trend}</div>
            </div>
            <div className="mt-8">
              <div className="text-4xl font-black">{stat.value}</div>
              <div className="text-sm font-medium text-gray-500 uppercase mt-1 tracking-widest">{stat.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="space-y-6">
        <h2 className="text-xl font-bold flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-blue-500" />
          Quick Operations
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {quickActions.map((action, i) => (
            <Link key={i} href={action.href}>
              <div className="glass p-8 rounded-3xl group hover:bg-blue-500/10 transition-all flex flex-col items-center text-center gap-4 relative overflow-hidden">
                <div className={`p-4 rounded-full ${action.bg} ${action.color} group-hover:scale-110 transition-transform`}>
                  <action.icon className="w-8 h-8" />
                </div>
                <div>
                  <div className="text-lg font-bold group-hover:text-blue-500 transition-colors">{action.name}</div>
                  <p className="text-xs text-gray-500 mt-1 uppercase tracking-widest">Execute Protocol</p>
                </div>
                {/* Decorative background element */}
                <div className="absolute -right-4 -bottom-4 w-20 h-20 bg-blue-500/5 rounded-full blur-2xl group-hover:bg-blue-500/10 transition-all" />
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Footer Info */}
      <div className="pt-10 flex flex-col md:flex-row justify-between items-center text-[10px] font-mono text-gray-600 uppercase tracking-widest gap-4">
        <div className="flex items-center gap-2">
          <Clock className="w-3 h-3" />
          Last System Heartbeat: {new Date().toLocaleTimeString()}
        </div>
        <div className="flex gap-6">
          <Link href="#" className="hover:text-blue-500">Security Log</Link>
          <Link href="#" className="hover:text-blue-500">API Uptime</Link>
        </div>
      </div>
    </div>
  );
}
