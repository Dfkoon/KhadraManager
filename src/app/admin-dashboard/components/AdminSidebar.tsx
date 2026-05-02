"use client";

import { LayoutDashboard, Users, Tag, FileText, LogOut, ChevronRight, Shield } from "lucide-react";
import { useRouter } from "next/navigation";

export default function AdminSidebar({ activeTab, setActiveTab, isOpen, setIsOpen }: any) {
  const router = useRouter();

  const tabs = [
    { id: "overview", label: "نظرة عامة", icon: <LayoutDashboard size={20} /> },
    { id: "supervisors", label: "المشرفون", icon: <Users size={20} /> },
    { id: "products", label: "التسعيرة", icon: <Tag size={20} /> },
    { id: "reports", label: "التقارير", icon: <FileText size={20} /> },
  ];

  return (
    <div className={`bg-sidebar-bg text-white transition-all duration-300 relative hidden md:flex flex-col ${isOpen ? 'w-64' : 'w-[68px]'}`}>
      <div className="h-[65px] border-b border-white/10 flex items-center justify-center relative">
        {isOpen && (
          <div className="flex items-center gap-2 font-bold text-lg">
            <Shield className="text-green-400" size={24} />
            <span>المدير الرئيسي</span>
          </div>
        )}
        {!isOpen && <Shield className="text-green-400" size={24} />}
        
        <button 
          onClick={() => setIsOpen(!isOpen)}
          className="absolute -left-3 top-1/2 -translate-y-1/2 w-6 h-6 bg-primary rounded-full flex items-center justify-center text-white border-2 border-background shadow-md"
        >
          <ChevronRight size={14} className={`transition-transform ${!isOpen ? 'rotate-180' : ''}`} />
        </button>
      </div>

      <div className="flex-1 py-6 flex flex-col gap-2 px-3">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-3 px-3 py-3 rounded-xl transition-colors ${
              activeTab === tab.id ? 'bg-primary/20 text-primary-light border border-primary/30' : 'text-white/60 hover:bg-white/5 hover:text-white'
            }`}
            title={!isOpen ? tab.label : ""}
          >
            {tab.icon}
            {isOpen && <span className="font-medium whitespace-nowrap">{tab.label}</span>}
          </button>
        ))}
      </div>

      <div className="p-3 border-t border-white/10">
        <button
          onClick={() => router.push("/")}
          className="flex items-center gap-3 px-3 py-3 rounded-xl text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-colors w-full"
          title={!isOpen ? "تسجيل الخروج" : ""}
        >
          <LogOut size={20} className="rotate-180" />
          {isOpen && <span className="font-medium whitespace-nowrap">تسجيل الخروج</span>}
        </button>
      </div>
    </div>
  );
}
