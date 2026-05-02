"use client";

import { useState } from "react";
import { Plus, Search, UserCog, ShieldCheck, Power, PowerOff } from "lucide-react";
import { toast } from "sonner";

export default function ClerksPanel({ clerks, setClerks }: any) {
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !username || !password) return;
    setIsLoading(true);
    try {
      const res = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, username, password, role: 'CLERK' })
      });
      if (res.ok) {
        const newUser = await res.json();
        setClerks([...clerks, newUser]);
        setName(""); setUsername(""); setPassword("");
        toast.success("تم تعيين مدخل أعداد جديد");
      }
    } catch (error) {
      toast.error("فشل في إضافة المدخل");
    } finally {
      setIsLoading(false);
    }
  };

  const toggleStatus = async (clerk: any) => {
    try {
      const res = await fetch(`/api/users/${clerk.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !clerk.isActive })
      });
      if (res.ok) {
        const updated = await res.json();
        setClerks((prev: any[]) => prev.map((c: any) => c.id === clerk.id ? updated : c));
        toast.success(updated.isActive ? "تم تفعيل حساب المدخل" : "تم إيقاف حساب المدخل");
      }
    } catch (error) {
      toast.error("فشل في تغيير الحالة");
    }
  };

  const filtered = clerks.filter((c: any) => c.name.toLowerCase().includes(searchTerm.toLowerCase()) || c.username.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="space-y-6 animate-fade-in max-w-4xl mx-auto">
      <div className="bg-white rounded-2xl border border-border shadow-panel overflow-hidden">
        <div className="p-5 bg-gradient-to-r from-blue-600 to-indigo-700 text-white flex items-center gap-2">
          <UserCog size={20} />
          <h3 className="font-bold text-lg">تعيين مدخلي أعداد (تحت إشراف ميسون)</h3>
        </div>
        
        <form onSubmit={handleAdd} className="p-6 grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
          <div className="md:col-span-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">الاسم</label>
            <input value={name} onChange={(e)=>setName(e.target.value)} className="w-full px-4 py-2.5 rounded-xl border border-border bg-gray-50 outline-none" placeholder="زيد أبو كريم" />
          </div>
          <div className="md:col-span-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">المعرف (Username)</label>
            <input value={username} onChange={(e)=>setUsername(e.target.value)} className="w-full px-4 py-2.5 rounded-xl border border-border bg-gray-50 outline-none" placeholder="zaid.clerk" dir="ltr" />
          </div>
          <div className="md:col-span-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">كلمة المرور</label>
            <input value={password} onChange={(e)=>setPassword(e.target.value)} className="w-full px-4 py-2.5 rounded-xl border border-border bg-gray-50 outline-none" placeholder="••••" dir="ltr" />
          </div>
          <button type="submit" disabled={isLoading} className="h-[46px] bg-gradient-primary text-white rounded-xl font-bold flex items-center justify-center gap-2 shadow-elevated">
            <Plus size={18} /> تعيين
          </button>
        </form>
      </div>

      <div className="bg-card rounded-2xl border border-border shadow-panel overflow-hidden">
        <div className="p-4 bg-gray-50/50 border-b border-border flex justify-between items-center">
          <h3 className="font-bold text-lg">المدخلين الحاليين ({clerks.length})</h3>
          <div className="relative w-64">
             <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
             <input value={searchTerm} onChange={(e)=>setSearchTerm(e.target.value)} className="w-full pr-10 pl-4 py-2 rounded-xl border border-border text-sm outline-none" placeholder="بحث..." />
          </div>
        </div>
        <div className="divide-y divide-border">
          {filtered.map((clerk: any) => (
            <div key={clerk.id} className="p-4 flex items-center justify-between hover:bg-gray-50/50 transition-colors">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ${Boolean(clerk.isActive) ? 'bg-amber-100 text-amber-700' : 'bg-gray-100 text-gray-400'}`}>
                   {clerk.name.charAt(0)}
                </div>
                <div className="flex flex-col">
                  <span className={`font-bold ${Boolean(clerk.isActive) ? 'text-gray-800' : 'text-gray-400 line-through'}`}>{clerk.name}</span>
                  <span className="text-[10px] text-gray-400" dir="ltr">{clerk.username}</span>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className={`text-[10px] px-3 py-1 rounded-full font-bold border ${Boolean(clerk.isActive) ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-700 border-red-200'}`}>
                  {Boolean(clerk.isActive) ? 'نشط' : 'متوقف'}
                </span>
                <button 
                  onClick={() => toggleStatus(clerk)}
                  className={`p-2 rounded-xl border transition-all ${Boolean(clerk.isActive) ? 'text-red-500 border-red-100 hover:bg-red-50' : 'text-green-500 border-green-100 hover:bg-green-50'}`}
                  title={Boolean(clerk.isActive) ? "إيقاف الحساب" : "تفعيل الحساب"}
                >
                  {Boolean(clerk.isActive) ? <PowerOff size={18} /> : <Power size={18} />}
                </button>
              </div>
            </div>
          ))}
          {filtered.length === 0 && (
            <div className="p-12 text-center text-gray-400">لا يوجد مدخلين يطابقون البحث</div>
          )}
        </div>
      </div>
    </div>
  );
}
