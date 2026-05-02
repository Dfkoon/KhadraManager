"use client";

import { useState, useEffect } from "react";
import { Wallet, Plus, Trash2, Calendar, Tag, CreditCard } from "lucide-react";
import { toast } from "sonner";

export default function ExpensesPanel() {
  const [expenses, setExpenses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [category, setCategory] = useState("OTHER");
  const [amount, setAmount] = useState<number | "">("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState(new Date().toLocaleDateString('en-CA'));

  const categories = [
    { id: "DIESEL", label: "ديزل / وقود", icon: "⛽" },
    { id: "SEEDS", label: "بذور / شتلات", icon: "🌱" },
    { id: "FERTILIZER", label: "أسمدة / كيماوي", icon: "🧪" },
    { id: "MAINTENANCE", label: "صيانة / تصليح", icon: "🛠️" },
    { id: "OTHER", label: "مصاريف أخرى", icon: "📝" },
  ];

  useEffect(() => {
    fetchExpenses();
  }, []);

  const fetchExpenses = async () => {
    try {
      const res = await fetch('/api/expenses');
      if (res.ok) setExpenses(await res.json());
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || !date) return;

    try {
      const res = await fetch('/api/expenses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ category, amount, date, description })
      });
      if (res.ok) {
        const saved = await res.json();
        setExpenses([saved, ...expenses]);
        setAmount("");
        setDescription("");
        toast.success("تم تسجيل المصروف بنجاح");
      }
    } catch (error) {
      toast.error("فشل في التسجيل");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("هل أنت متأكد من الحذف؟")) return;
    try {
      const res = await fetch(`/api/expenses/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setExpenses(expenses.filter((e: any) => e.id !== id));
        toast.success("تم الحذف");
      }
    } catch (error) {
      toast.error("فشل الحذف");
    }
  };

  const totalExpenses = expenses.reduce((acc, curr: any) => acc + curr.amount, 0);

  return (
    <div className="space-y-6 animate-fade-in max-w-4xl mx-auto pb-24">
      {/* Add Expense Form */}
      <div className="bg-white rounded-2xl border border-border shadow-panel overflow-hidden">
        <div className="p-5 bg-gradient-to-r from-red-600 to-rose-700 text-white flex items-center gap-2">
          <Wallet size={20} />
          <h3 className="font-bold text-lg">تسجيل مصروف جديد</h3>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">الفئة</label>
              <select 
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-border bg-gray-50 outline-none"
              >
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.icon} {cat.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">المبلغ (دينار)</label>
              <input 
                type="number"
                step="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value === "" ? "" : Number(e.target.value))}
                className="w-full px-4 py-3 rounded-xl border border-border bg-gray-50 outline-none"
                placeholder="0.00"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">التاريخ</label>
              <input 
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-border bg-gray-50 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">ملاحظات</label>
              <input 
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-border bg-gray-50 outline-none"
                placeholder="مثلاً: شراء ديزل للتراكتور"
              />
            </div>
          </div>
          <button 
            type="submit"
            className="w-full h-14 bg-red-600 text-white rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg"
          >
            <Plus size={18} /> تسجيل المصروف
          </button>
        </form>
      </div>

      {/* Summary Card */}
      <div className="bg-red-50 border border-red-100 p-6 rounded-2xl flex justify-between items-center">
        <div>
          <p className="text-red-600 text-sm font-bold uppercase tracking-wider">إجمالي المصاريف المسجلة</p>
          <h4 className="text-3xl font-black text-red-700 mt-1">{totalExpenses.toLocaleString()} <span className="text-lg font-normal">دينار</span></h4>
        </div>
        <CreditCard size={40} className="text-red-200" />
      </div>

      {/* List */}
      <div className="bg-white rounded-2xl border border-border shadow-panel overflow-hidden">
        <div className="p-4 border-b border-border bg-gray-50 font-bold text-gray-700">
          سجل المصاريف الأخيرة
        </div>
        <div className="divide-y divide-border">
          {expenses.map((exp: any) => (
            <div key={exp.id} className="p-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-red-100 text-red-600 flex items-center justify-center text-lg">
                  {categories.find(c => c.id === exp.category)?.icon}
                </div>
                <div>
                  <p className="font-bold text-gray-900">{categories.find(c => c.id === exp.category)?.label}</p>
                  <p className="text-xs text-gray-500">{exp.description || 'بدون ملاحظات'}</p>
                  <p className="text-[10px] text-gray-400 font-mono mt-1 flex items-center gap-1">
                    <Calendar size={10} /> {exp.date}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <span className="font-bold text-red-600 text-lg">{exp.amount} <span className="text-xs">د.أ</span></span>
                <button onClick={() => handleDelete(exp.id)} className="p-2 text-gray-300 hover:text-red-500 rounded-lg">
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          ))}
          {expenses.length === 0 && (
            <div className="p-12 text-center text-gray-400">لا يوجد مصاريف مسجلة بعد</div>
          )}
        </div>
      </div>
    </div>
  );
}
