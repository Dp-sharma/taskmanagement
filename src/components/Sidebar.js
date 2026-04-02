"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, MessageSquareCode, CheckSquare, Users, Settings, LogOut } from "lucide-react";
import ThemeToggle from "./ThemeToggle";

const navItems = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "AI Assistant", href: "/assistant", icon: MessageSquareCode },
  { name: "Task Tracker", href: "/app", icon: CheckSquare },
  { name: "School Leads", href: "/leads", icon: Users },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden md:flex flex-col w-64 h-screen fixed left-0 top-0 glass border-r border-white/10 z-50 transition-all duration-300">
      <div className="p-6">
        <h1 className="text-2xl font-black bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-purple-600 tracking-tighter">
          JARVIS
        </h1>
        <p className="text-[10px] uppercase tracking-widest text-gray-500 font-mono mt-1">
          Neural OS v3.0
        </p>
      </div>

      <nav className="flex-1 px-4 space-y-2 mt-4">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link key={item.name} href={item.href}>
              <div className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all group ${
                isActive 
                ? "bg-blue-600 text-white shadow-lg shadow-blue-600/30" 
                : "text-gray-500 hover:bg-blue-500/10 hover:text-blue-500"
              }`}>
                <Icon className={`w-5 h-5 transition-transform group-hover:scale-110 ${isActive ? "text-white" : ""}`} />
                <span className="font-medium text-sm">{item.name}</span>
              </div>
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-white/5 space-y-4">
        <div className="flex items-center justify-between px-4">
          <span className="text-xs font-mono text-gray-500 uppercase tracking-widest">Theme</span>
          <ThemeToggle />
        </div>
        <Link href="/logout-button">
          <div className="flex items-center gap-3 px-4 py-3 rounded-xl text-red-500 hover:bg-red-500/10 transition-all group cursor-pointer">
            <LogOut className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
            <span className="font-medium text-sm">Logout</span>
          </div>
        </Link>
      </div>
    </aside>
  );
}
