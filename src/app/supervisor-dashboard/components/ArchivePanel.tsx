"use client";

import { useState } from "react";
import { History, FileText, Download, Trash2, Calendar, ChevronLeft, Search, Printer, Package, Timer } from "lucide-react";
import { toast } from "sonner";

export default function ArchivePanel({ entries, products }: any) {
  const [searchTerm, setSearchTerm] = useState("");
  
  // Group entries by date
  const groupedByDate = entries.reduce((acc: any, entry: any) => {
    if (!acc[entry.date]) acc[entry.date] = [];
    acc[entry.date].push(entry);
    return acc;
  }, {});

  const dates = Object.keys(groupedByDate).sort((a, b) => b.localeCompare(a));
  const filteredDates = dates.filter(d => d.includes(searchTerm));

  const handleDeleteDay = async (date: string) => {
    if (!confirm(`هل أنت متأكد من حذف جميع سجلات يوم ${date} نهائياً من الأرشيف؟`)) return;
    
    const dayEntries = groupedByDate[date];
    const ids = dayEntries.map((e: any) => e.id);
    
    try {
      // We can use a bulk delete if we have the API, or just delete one by one
      // For now, let's assume we can delete by date range or similar
      const res = await fetch(`/api/entries/bulk-delete`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids })
      });

      if (res.ok) {
        toast.success(`تم حذف سجلات يوم ${date}`);
        window.location.reload();
      }
    } catch (error) {
      toast.error("فشل في حذف السجلات");
    }
  };

  const handlePrintDay = (date: string) => {
    const dayEntries = groupedByDate[date];
    const pieceEntries = dayEntries.filter((e: any) => !e.startTime);
    const hourlyEntries = dayEntries.filter((e: any) => e.startTime);
    
    const totalBoxes = pieceEntries.reduce((acc: number, e: any) => acc + (e.boxes || 0), 0);
    const totalPieceAmount = pieceEntries.reduce((acc: number, e: any) => acc + (e.amount || 0), 0);
    const totalHourlyAmount = hourlyEntries.reduce((acc: number, e: any) => acc + (e.amount || 0), 0);

    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    let pieceRows = pieceEntries.map((e: any) => `
      <tr><td>${e.time}</td><td>${e.workerName}</td><td>${e.productName}</td><td style="text-align:center">${e.boxes}</td><td style="text-align:center">${e.amount}</td></tr>
    `).join('');

    let hourlyRows = hourlyEntries.map((e: any) => `
      <tr><td>${e.workerName}</td><td>${e.startTime} - ${e.endTime}</td><td style="text-align:center">${e.breakMinutes} د</td><td style="text-align:center">${e.amount.toFixed(2)}</td></tr>
    `).join('');

    printWindow.document.write(`
      <html dir="rtl">
        <head>
          <title>أرشيف خضرا - ${date}</title>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@400;700&display=swap');
            body { font-family: 'Cairo', sans-serif; padding: 40px; }
            .header { text-align: center; border-bottom: 2px solid #10b981; padding-bottom: 10px; margin-bottom: 20px; }
            table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
            th, td { border: 1px solid #eee; padding: 8px; text-align: right; font-size: 12px; }
            th { background: #f9fafb; }
            .stats { display: flex; gap: 20px; margin-bottom: 20px; justify-content: center; }
            .stat { border: 1px solid #eee; padding: 10px; border-radius: 5px; text-align: center; min-width: 100px; }
          </style>
        </head>
        <body>
          <div class="header"><h1>سجل أرشيف يوم: ${date}</h1></div>
          <div class="stats">
            <div class="stat"><b>بكسات:</b> ${totalBoxes}</div>
            <div class="stat"><b>أجور بكسات:</b> ${totalPieceAmount}</div>
            <div class="stat"><b>أجور ساعة:</b> ${totalHourlyAmount.toFixed(2)}</div>
          </div>
          <h3>إنتاج البكسة</h3>
          <table><thead><tr><th>الوقت</th><th>العامل</th><th>المنتج</th><th>العدد</th><th>المبلغ</th></tr></thead><tbody>${pieceRows}</tbody></table>
          <h3>عمال الساعة</h3>
          <table><thead><tr><th>العامل</th><th>الفترة</th><th>استراحة</th><th>المبلغ</th></tr></thead><tbody>${hourlyRows}</tbody></table>
          <script>window.print();</script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-5xl mx-auto pb-24">
      <div className="bg-white rounded-2xl border border-border shadow-panel overflow-hidden">
        <div className="p-5 bg-gradient-to-r from-gray-700 to-gray-900 text-white flex justify-between items-center">
          <div className="flex items-center gap-2">
            <History size={20} />
            <h3 className="font-bold text-lg">أرشيف الكشوفات اليومية</h3>
          </div>
          <div className="relative w-48 md:w-64">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40" size={16} />
            <input 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-white/10 border border-white/20 rounded-lg py-1.5 pr-10 pl-4 text-sm text-white placeholder:text-white/40 focus:bg-white/20 outline-none transition-all"
              placeholder="بحث بالتاريخ (2026-05)..."
            />
          </div>
        </div>

        <div className="divide-y divide-border">
          {filteredDates.map(date => {
            const dayEntries = groupedByDate[date];
            const pieceCount = dayEntries.filter((e: any) => !e.startTime).reduce((acc: number, e: any) => acc + (e.boxes || 0), 0);
            const hourlyCount = dayEntries.filter((e: any) => e.startTime).length;
            const totalAmount = dayEntries.reduce((acc: number, e: any) => acc + e.amount, 0);

            return (
              <div key={date} className="p-6 flex flex-col md:flex-row md:items-center justify-between hover:bg-gray-50 transition-colors gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-gray-100 text-gray-500 flex items-center justify-center">
                    <Calendar size={24} />
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900 text-lg">{date}</h4>
                    <div className="flex gap-3 mt-1">
                      <span className="text-[10px] bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full flex items-center gap-1">
                        <Package size={10} /> {pieceCount} بكسة
                      </span>
                      <span className="text-[10px] bg-orange-50 text-orange-600 px-2 py-0.5 rounded-full flex items-center gap-1">
                        <Timer size={10} /> {hourlyCount} وردية ساعة
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="text-left md:text-right px-4">
                    <p className="text-[10px] text-gray-400 font-bold uppercase">إجمالي اليوم</p>
                    <p className="text-lg font-black text-gray-700">{totalAmount.toLocaleString()} <span className="text-xs font-normal">د.أ</span></p>
                  </div>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => handlePrintDay(date)}
                      className="p-3 bg-white border border-border text-gray-600 rounded-xl hover:bg-gray-50 shadow-sm"
                      title="طباعة PDF"
                    >
                      <Printer size={18} />
                    </button>
                    <button 
                      onClick={() => handleDeleteDay(date)}
                      className="p-3 bg-red-50 text-red-500 border border-red-100 rounded-xl hover:bg-red-100 shadow-sm"
                      title="حذف السجل"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}

          {filteredDates.length === 0 && (
            <div className="p-20 text-center flex flex-col items-center gap-4 text-gray-400">
              <History size={48} className="text-gray-200" />
              <p className="font-medium">الأرشيف فارغ حالياً.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
