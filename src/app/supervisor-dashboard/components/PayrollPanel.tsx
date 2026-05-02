"use client";

import { useState, useEffect } from "react";
import { DollarSign, CheckCircle, Clock, User, Calendar, Search, ChevronDown, ChevronUp, Package, Timer, Filter, X } from "lucide-react";
import { toast } from "sonner";

export default function PayrollPanel({ workers, entries, products }: any) {
  const [searchTerm, setSearchTerm] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [expandedWorker, setExpandedWorker] = useState<string | null>(null);
  
  // Filters
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [filterType, setFilterType] = useState("ALL"); // ALL, PIECE, HOURLY

  // Group entries by worker that are APPROVED and NOT PAID
  const unpaidTotals = workers.map((worker: any) => {
    let workerEntries = entries.filter((e: any) => e.workerId === worker.id && e.status === 'APPROVED' && !e.isPaid);
    
    // Apply Filters
    if (startDate) workerEntries = workerEntries.filter((e: any) => e.date >= startDate);
    if (endDate) workerEntries = workerEntries.filter((e: any) => e.date <= endDate);
    if (filterType === "PIECE") workerEntries = workerEntries.filter((e: any) => !e.startTime);
    if (filterType === "HOURLY") workerEntries = workerEntries.filter((e: any) => e.startTime);

    const totalAmount = workerEntries.reduce((acc: number, curr: any) => acc + curr.amount, 0);
    const pieceCount = workerEntries.filter((e: any) => !e.startTime).reduce((acc: number, curr: any) => acc + curr.boxes, 0);
    const hourlyCount = workerEntries.filter((e: any) => e.startTime).length;
    
    return {
      ...worker,
      totalUnpaid: totalAmount,
      pieceCount,
      hourlyCount,
      unpaidEntries: workerEntries
    };
  }).filter((w: any) => w.totalUnpaid > 0);

  const filtered = unpaidTotals.filter((w: any) => w.name.toLowerCase().includes(searchTerm.toLowerCase()));

  const handleSettle = async (worker: any) => {
    const periodMsg = (startDate || endDate) ? ` للفترة المحددة` : "";
    if (!confirm(`هل أنت متأكد من تسوية مبلغ ${worker.totalUnpaid} دينار للعامل ${worker.name}${periodMsg}؟\nسيتم وضع السجلات المحددة كـ "تم الدفع".`)) return;

    setIsProcessing(true);
    try {
      const res = await fetch('/api/payroll/mark-paid', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          workerId: worker.id,
          startDate: startDate || '2000-01-01',
          endDate: endDate || new Date().toLocaleDateString('en-CA')
        })
      });

      if (res.ok) {
        toast.success(`تمت تسوية حساب ${worker.name} بنجاح`);
        window.location.reload(); 
      }
    } catch (error) {
      toast.error("فشل في عملية التسوية");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-5xl mx-auto pb-24">
      {/* Filter Bar */}
      <div className="bg-white rounded-2xl border border-border shadow-sm p-4 flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-2 text-gray-500 min-w-max">
          <Filter size={18} />
          <span className="text-sm font-bold">تصفية النتائج:</span>
        </div>
        
        <div className="flex items-center gap-2">
          <label className="text-[10px] font-bold text-gray-400 uppercase">من</label>
          <input 
            type="date" 
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="px-3 py-1.5 rounded-lg border border-border text-xs outline-none"
          />
        </div>
        
        <div className="flex items-center gap-2">
          <label className="text-[10px] font-bold text-gray-400 uppercase">إلى</label>
          <input 
            type="date" 
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="px-3 py-1.5 rounded-lg border border-border text-xs outline-none"
          />
        </div>

        <select 
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          className="px-3 py-1.5 rounded-lg border border-border text-xs outline-none"
        >
          <option value="ALL">الكل (ساعة + بكسة)</option>
          <option value="PIECE">نظام البكسة فقط</option>
          <option value="HOURLY">نظام الساعة فقط</option>
        </select>

        {(startDate || endDate || filterType !== "ALL") && (
          <button 
            onClick={() => { setStartDate(""); setEndDate(""); setFilterType("ALL"); }}
            className="text-red-500 text-xs font-bold hover:underline"
          >
            مسح الفلاتر
          </button>
        )}
      </div>

      <div className="bg-white rounded-2xl border border-border shadow-panel overflow-hidden">
        <div className="p-5 bg-gradient-to-r from-emerald-600 to-green-700 text-white flex justify-between items-center">
          <div className="flex items-center gap-2">
            <DollarSign size={20} />
            <h3 className="font-bold text-lg">تسوية الرواتب المستحقة</h3>
          </div>
          <div className="relative w-48 md:w-64">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-white/60" size={16} />
            <input 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-white/10 border border-white/20 rounded-lg py-1.5 pr-10 pl-4 text-sm text-white placeholder:text-white/40 focus:bg-white/20 outline-none transition-all"
              placeholder="بحث عن عامل..."
            />
          </div>
        </div>

        <div className="divide-y divide-border">
          {filtered.map((worker: any) => (
            <div key={worker.id} className="flex flex-col">
              <div className="p-6 flex flex-col md:flex-row md:items-center justify-between hover:bg-gray-50 transition-colors gap-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center font-bold text-xl">
                    {worker.name.charAt(0)}
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900 text-lg">{worker.name}</h4>
                    <div className="flex gap-3 mt-1">
                      <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full flex items-center gap-1">
                        <Clock size={12} /> {worker.hourlyCount} وردية ساعة
                      </span>
                      <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full flex items-center gap-1">
                        <Calendar size={12} /> {worker.pieceCount} بكسة منتجة
                      </span>
                      <button 
                        onClick={() => setExpandedWorker(expandedWorker === worker.id ? null : worker.id)}
                        className="text-primary text-xs font-bold flex items-center gap-1 hover:underline"
                      >
                        {expandedWorker === worker.id ? <ChevronUp size={14}/> : <ChevronDown size={14}/>}
                        {expandedWorker === worker.id ? 'إخفاء التفاصيل' : 'عرض التفاصيل'}
                      </button>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-6">
                  <div className="text-left md:text-right">
                    <p className="text-[10px] text-gray-400 font-bold uppercase">المستحق المصفى</p>
                    <p className="text-2xl font-black text-emerald-700">{worker.totalUnpaid.toLocaleString()} <span className="text-sm font-normal">دينار</span></p>
                  </div>
                  <button 
                    onClick={() => handleSettle(worker)}
                    disabled={isProcessing}
                    className="bg-emerald-600 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-emerald-700 shadow-lg transition-all active:scale-95 disabled:opacity-50"
                  >
                    <CheckCircle size={18} />
                    تسوية ودفع
                  </button>
                </div>
              </div>

              {/* Detail Breakdown */}
              {expandedWorker === worker.id && (
                <div className="bg-gray-50 p-4 md:px-12 pb-6 animate-in slide-in-from-top-2">
                  <div className="bg-white rounded-xl border border-border overflow-hidden">
                    <table className="w-full text-right text-xs">
                      <thead className="bg-gray-100 text-gray-500 font-bold uppercase">
                        <tr>
                          <th className="px-4 py-2">التاريخ</th>
                          <th className="px-4 py-2">النوع</th>
                          <th className="px-4 py-2">التفاصيل</th>
                          <th className="px-4 py-2 text-center">المبلغ</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border">
                        {worker.unpaidEntries.map((e: any) => (
                          <tr key={e.id} className="hover:bg-gray-50">
                            <td className="px-4 py-2 font-mono">{e.date}</td>
                            <td className="px-4 py-2">
                              {e.startTime ? (
                                <span className="flex items-center gap-1 text-blue-600 font-bold">
                                  <Timer size={12} /> ساعة
                                </span>
                              ) : (
                                <span className="flex items-center gap-1 text-orange-600 font-bold">
                                  <Package size={12} /> بكسة
                                </span>
                              )}
                            </td>
                            <td className="px-4 py-2">
                              {e.startTime ? (
                                `${e.startTime} - ${e.endTime} (${e.breakMinutes} د استراحة)`
                              ) : (
                                `${e.boxes} بكسة (${products.find((p: any) => p.id === e.productId)?.name || '?'})`
                              )}
                            </td>
                            <td className="px-4 py-2 text-center font-bold text-gray-700">{e.amount}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          ))}
          
          {filtered.length === 0 && (
            <div className="p-20 text-center flex flex-col items-center gap-4 text-gray-400">
              <CheckCircle size={48} className="text-emerald-200" />
              <p className="font-medium">لا يوجد مستحقات مطابقة للفلاتر الحالية.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
