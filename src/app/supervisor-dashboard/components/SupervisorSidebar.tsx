"use client";

import { ClipboardList, Users, LogOut, ChevronRight, Sprout, UserCheck, CheckSquare, UserPlus, Tag, TrendingUp, DollarSign, Wallet, History } from "lucide-react";
import { useRouter } from "next/navigation";
import { signOut } from "next-auth/react";

export default function SupervisorSidebar({ activeTab, setActiveTab, isOpen, setIsOpen, role }: any) {
  const router = useRouter();

  const isHead = role === 'ADMIN' || role === 'HEAD_SUPERVISOR';

  const tabs = [
    { id: "entry", label: "الإدخال اليومي", icon: <ClipboardList size={20} /> },
    ...(isHead ? [
      { id: "reports", label: "التقارير والإحصائيات", icon: <TrendingUp size={20} /> },
      { id: "attendance", label: "التحضير اليومي", icon: <UserCheck size={20} /> },
      { id: "approvals", label: "اعتماد الأعداد", icon: <CheckSquare size={20} /> },
      { id: "clerks", label: "تعيين مدخلين", icon: <UserPlus size={20} /> },
      { id: "payroll", label: "الرواتب والتسوية", icon: <DollarSign size={20} /> },
      { id: "expenses", label: "المصاريف", icon: <Wallet size={20} /> },
      { id: "archive", label: "الأرشيف", icon: <History size={20} /> },
      { id: "products", label: "أسعار البكس", icon: <Tag size={20} /> },
      { id: "workers", label: "إدارة العمال", icon: <Users size={20} /> },
    ] : []),
  ];

  return (
    <>
      {/* Desktop Sidebar */}
      <div className={`bg-sidebar-bg text-white transition-all duration-300 relative hidden md:flex flex-col ${isOpen ? 'w-64' : 'w-[68px]'} z-20`}>
        <div className="h-[65px] border-b border-white/10 flex items-center justify-center relative px-4">
          {isOpen && (
            <div className="flex items-center gap-2 font-bold text-lg overflow-hidden">
              <Sprout className="text-primary-light shrink-0" size={24} />
              <span className="truncate">KhadraManager</span>
            </div>
          )}
          {!isOpen && <Sprout className="text-primary-light" size={24} />}
          
          <button 
            onClick={() => setIsOpen(!isOpen)}
            className="absolute -left-3 top-1/2 -translate-y-1/2 w-6 h-6 bg-primary rounded-full flex items-center justify-center text-white border-2 border-background shadow-md"
          >
            <ChevronRight size={14} className={`transition-transform ${!isOpen ? 'rotate-180' : ''}`} />
          </button>
        </div>

        <div className="flex-1 py-6 flex flex-col gap-2 px-3 overflow-y-auto overflow-x-hidden">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-3 px-3 py-3 rounded-xl transition-colors ${
                activeTab === tab.id ? 'bg-primary/20 text-primary-light border border-primary/30' : 'text-white/60 hover:bg-white/5 hover:text-white'
              }`}
              title={!isOpen ? tab.label : ""}
            >
              <span className="shrink-0">{tab.icon}</span>
              {isOpen && <span className="font-medium whitespace-nowrap truncate">{tab.label}</span>}
            </button>
          ))}
        </div>

        <div className="p-3 border-t border-white/10">
          <button
            onClick={() => signOut()}
            className="flex items-center gap-3 px-3 py-3 rounded-xl text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-colors w-full"
            title={!isOpen ? "تسجيل الخروج" : ""}
          >
            <LogOut size={20} className="rotate-180 shrink-0" />
            {isOpen && <span className="font-medium whitespace-nowrap">تسجيل الخروج</span>}
          </button>
        </div>
      </div>

      {/* Mobile Bottom Navigation */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-border shadow-[0_-4px_10px_rgba(0,0,0,0.05)] z-50 flex justify-around items-center h-16 pb-safe overflow-x-auto no-scrollbar">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex flex-col items-center justify-center min-w-[70px] w-full h-full gap-1 transition-colors ${
              activeTab === tab.id ? 'text-primary' : 'text-gray-400 hover:text-gray-600'
            }`}
          >
            <div className={`p-1 rounded-full ${activeTab === tab.id ? 'bg-primary/10' : ''}`}>
              {tab.icon}
            </div>
            <span className="text-[10px] font-bold whitespace-nowrap">{tab.label}</span>
          </button>
        ))}
      </div>
      {/* Version Indicator */}
      <div className="mt-auto px-4 pb-4">
        <div className="text-[10px] text-gray-400 font-mono bg-white/5 rounded px-2 py-1 flex items-center justify-between">
          <span>الإصدار</span>
          <span>v1.1.0</span>
        </div>
      </div>
    </>
  );
}
