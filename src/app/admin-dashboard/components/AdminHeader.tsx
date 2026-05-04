"use client";

import { Bell } from "lucide-react";

export default function AdminHeader({ user }: any) {
  const dateStr = new Date().toLocaleDateString('ar-EG', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  return (
    <header className="h-[65px] bg-white border-b border-border shadow-sm flex items-center justify-between px-6 z-10 sticky top-0">
      <div className="flex items-center gap-4">
        <div>
          <h2 className="font-bold text-foreground">مرحباً، {user?.name || "المدير الرئيسي"}</h2>
          <p className="text-xs text-gray-500">{dateStr}</p>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="hidden sm:flex items-center gap-2 text-sm text-green-700 bg-green-50 border border-green-200 px-3 py-1.5 rounded-full">
          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse-soft"></div>
          النظام يعمل
        </div>
        
        <button className="w-10 h-10 rounded-full border border-border flex items-center justify-center text-gray-500 hover:bg-gray-50 transition-colors relative">
          <Bell size={20} />
          <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
        </button>
      </div>
    </header>
  );
}
