"use client";

import { useState } from "react";
import { Download, Search, Filter } from "lucide-react";
import { DailyEntry } from "../page";

export default function ReportsPanel({ entries, supervisors, products }: any) {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterSupervisor, setFilterSupervisor] = useState("all");
  const [filterProduct, setFilterProduct] = useState("all");

  const filteredEntries = entries.filter((e: DailyEntry) => {
    const matchSearch = e.workerName.includes(searchTerm) || e.supervisorName.includes(searchTerm);
    const matchSup = filterSupervisor === "all" || e.supervisorId === filterSupervisor;
    const matchProd = filterProduct === "all" || e.productId === filterProduct;
    return matchSearch && matchSup && matchProd;
  });

  const exportCSV = () => {
    const headers = ["التاريخ", "الوقت", "المشرف", "العامل", "نوع العمل", "المنتج", "الكمية/الساعات", "المبلغ (قرش)", "الحالة"];
    const rows = filteredEntries.map((e: any) => 
      [e.date, e.time, e.supervisorName, e.workerName, e.startTime ? "ساعة" : "بكسة", e.productName, e.boxes || "-", e.amount, e.status === 'APPROVED' ? "معتمد" : "معلق"].join(",")
    );
    
    const csvContent = "\uFEFF" + headers.join(",") + "\n" + rows.join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `khadra_report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const totalBoxes = filteredEntries.reduce((acc: number, e: DailyEntry) => acc + e.boxes, 0);
  const totalAmount = filteredEntries.reduce((acc: number, e: DailyEntry) => acc + e.amount, 0);

  const getProductColor = (name: string) => {
    if (name.includes('بندورة')) return 'bg-red-50 text-red-600 border-red-200';
    if (name.includes('خيار')) return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    if (name.includes('فلفل')) return 'bg-orange-50 text-orange-600 border-orange-200';
    return 'bg-gray-50 text-gray-600 border-gray-200';
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-card rounded-xl border border-border p-4 shadow-sm flex flex-col justify-center items-center">
          <p className="text-gray-500 text-sm mb-1">إجمالي السجلات</p>
          <p className="text-2xl font-bold text-foreground">{filteredEntries.length}</p>
        </div>
        <div className="bg-card rounded-xl border border-border p-4 shadow-sm flex flex-col justify-center items-center">
          <p className="text-gray-500 text-sm mb-1">إجمالي البكسات</p>
          <p className="text-2xl font-bold text-primary">{totalBoxes}</p>
        </div>
        <div className="bg-card rounded-xl border border-border p-4 shadow-sm flex flex-col justify-center items-center">
          <p className="text-gray-500 text-sm mb-1">إجمالي الأجور</p>
          <p className="text-2xl font-bold text-orange-500">{totalAmount} <span className="text-sm font-normal text-gray-400">قرش</span></p>
        </div>
      </div>

      <div className="bg-card rounded-2xl border border-border shadow-panel overflow-hidden">
        <div className="p-4 border-b border-border bg-card-header flex flex-col md:flex-row gap-4 justify-between items-center">
          <div className="flex gap-2 w-full md:w-auto">
            <div className="relative flex-1 md:w-64">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-4 pr-10 py-2 rounded-xl border border-border bg-white focus:ring-ring focus:border-ring text-sm"
                placeholder="بحث..."
              />
            </div>
            <select 
              value={filterSupervisor}
              onChange={(e) => setFilterSupervisor(e.target.value)}
              className="px-3 py-2 rounded-xl border border-border bg-white focus:ring-ring focus:border-ring text-sm"
            >
              <option value="all">كل المشرفين</option>
              {supervisors.map((s: any) => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
            <select 
              value={filterProduct}
              onChange={(e) => setFilterProduct(e.target.value)}
              className="px-3 py-2 rounded-xl border border-border bg-white focus:ring-ring focus:border-ring text-sm"
            >
              <option value="all">كل المنتجات</option>
              {products.map((p: any) => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </div>
          
          <button 
            onClick={exportCSV}
            className="flex items-center gap-2 bg-white border border-border text-foreground px-4 py-2 rounded-xl hover:bg-gray-50 transition-colors shadow-sm text-sm font-medium w-full md:w-auto justify-center"
          >
            <Download size={16} />
            تصدير CSV
          </button>
        </div>
        
        <div className="overflow-x-auto max-h-[500px]">
          <table className="w-full text-right text-sm relative">
            <thead className="bg-gray-50/90 backdrop-blur-sm text-gray-500 font-medium border-b border-border sticky top-0 z-10">
              <tr>
                <th className="px-6 py-4">التاريخ والوقت</th>
                <th className="px-6 py-4">المشرف</th>
                <th className="px-6 py-4">العامل</th>
                <th className="px-6 py-4">المنتج / النوع</th>
                <th className="px-6 py-4 text-center">الكمية</th>
                <th className="px-6 py-4 text-center">المبلغ</th>
                <th className="px-6 py-4">الحالة</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredEntries.map((entry: DailyEntry) => (
                <tr key={entry.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-4" dir="ltr">
                    <div className="text-right">
                      <div className="font-medium text-gray-700">{entry.date}</div>
                      <div className="text-xs text-gray-500">{entry.time}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-xs font-bold">
                        {entry.supervisorName.charAt(0)}
                      </div>
                      <span className="font-medium">{entry.supervisorName}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 font-semibold text-foreground">{entry.workerName}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${getProductColor(entry.productName)}`}>
                      {entry.startTime ? "ساعة (مياومة)" : entry.productName}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center font-bold text-lg">{entry.boxes || "-"}</td>
                  <td className="px-6 py-4 text-center text-orange-600 font-semibold">{entry.amount} قرش</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-[10px] font-bold ${entry.status === 'APPROVED' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                      {entry.status === 'APPROVED' ? 'معتمد' : 'معلق'}
                    </span>
                  </td>
                </tr>
              ))}
              {filteredEntries.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                    لا توجد سجلات مطابقة.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
