import React from "react";
import { BookOpen, Camera, History } from "lucide-react";
import { cn } from "../lib/utils";

interface LayoutProps {
  children: React.ReactNode;
  activeTab: "recognition" | "notebook";
  onTabChange: (tab: "recognition" | "notebook") => void;
}

export default function Layout({ children, activeTab, onTabChange }: LayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <BookOpen className="text-white w-5 h-5" />
            </div>
            <h1 className="text-xl font-bold text-gray-900">错题举一反三</h1>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-4xl mx-auto w-full px-4 py-6 pb-24">
        {children}
      </main>

      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-2 flex justify-around items-center">
        <button
          onClick={() => onTabChange("recognition")}
          className={cn(
            "flex flex-col items-center gap-1 p-2 transition-colors",
            activeTab === "recognition" ? "text-blue-600" : "text-gray-500 hover:text-gray-700"
          )}
        >
          <Camera className="w-6 h-6" />
          <span className="text-xs font-medium">识别错题</span>
        </button>
        <button
          onClick={() => onTabChange("notebook")}
          className={cn(
            "flex flex-col items-center gap-1 p-2 transition-colors",
            activeTab === "notebook" ? "text-blue-600" : "text-gray-500 hover:text-gray-700"
          )}
        >
          <History className="w-6 h-6" />
          <span className="text-xs font-medium">错题本</span>
        </button>
      </nav>
    </div>
  );
}
