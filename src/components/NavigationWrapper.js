"use client";

import { usePathname } from "next/navigation";
import Sidebar from "./Sidebar";
import MobileNav from "./MobileNav";

export default function NavigationWrapper({ children }) {
  const pathname = usePathname();
  
  // Define pages where navigation should NOT be shown
  const noNavPages = ["/login", "/"];
  const isNoNavPage = noNavPages.includes(pathname);

  if (isNoNavPage) {
    return <main className="w-full">{children}</main>;
  }

  return (
    <div className="flex min-h-screen bg-white dark:bg-black transition-colors duration-300">
      <Sidebar />
      <main className="flex-1 md:ml-64 mb-20 md:mb-0 p-4 md:p-8 animate-fade-in">
        {children}
      </main>
      <MobileNav />
    </div>
  );
}
