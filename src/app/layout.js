import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProviderWrapper } from "@/components/ThemeProviderWrapper";
import NavigationWrapper from "@/components/NavigationWrapper";
import VoiceAssistant from "@/components/VoiceAssistant";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "JARVIS Protocol",
  description: "Next-gen Team Management & AI Assistant",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased bg-white dark:bg-black transition-colors duration-300`}>
        <ThemeProviderWrapper>
          <NavigationWrapper>
            {children}
            <VoiceAssistant />
          </NavigationWrapper>
        </ThemeProviderWrapper>
      </body>
    </html>
  );
}
