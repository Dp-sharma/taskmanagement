"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, MessageSquareCode, CheckSquare, Users } from "lucide-react";

const navItems = [
  { name: "Dash", href: "/dashboard", icon: LayoutDashboard },
  { name: "AI", href: "/assistant", icon: MessageSquareCode },
  { name: "Tasks", href: "/app", icon: CheckSquare },
  { name: "Leads", href: "/leads", icon: Users },
];

export default function MobileNav() {
  const pathname = usePathname();

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 glass border-t border-white/10 z-50 flex justify-around items-center p-4">
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = pathname === item.href;
        return (
          <Link key={item.name} href={item.href}>
            <div className={`flex flex-col items-center gap-1 transition-all ${
              isActive ? "text-blue-500" : "text-gray-500"
            }`}>
              <Icon className="w-6 h-6" />
              <span className="text-[10px] uppercase font-bold">{item.name}</span>
              {isActive && <div className="w-1 h-1 bg-blue-500 rounded-full mt-1 animate-pulse" />}
            </div>
          </Link>
        );
      })}
    </nav>
  );
}
