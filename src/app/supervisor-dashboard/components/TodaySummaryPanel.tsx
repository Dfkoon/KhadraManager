"use client";

import { Trash2, TrendingUp, Download, FileText, Table as TableIcon, Timer, Package, Smartphone, Printer } from "lucide-react";
import { toast } from "sonner";

export default function TodaySummaryPanel({ entries, setEntries, sessionClosed, isHead, workers, products }: any) {
  const visibleEntries = isHead ? entries : entries.filter((e: any) => !e.startTime);
  
  const pieceEntries = visibleEntries.filter((e: any) => !e.startTime);
  const hourlyEntries = visibleEntries.filter((e: any) => e.startTime);

  const totalBoxes = pieceEntries.reduce((acc: number, e: any) => acc + (e.boxes || 0), 0);
  const totalPieceAmount = pieceEntries.reduce((acc: number, e: any) => acc + (e.amount || 0), 0);
  const totalHourlyAmount = hourlyEntries.reduce((acc: number, e: any) => acc + (e.amount || 0), 0);
  
  const workerSummaries = workers.map((w: any) => {
    const wEntries = entries.filter((e: any) => e.workerId === w.id);
    return {
      ...w,
      boxes: wEntries.reduce((acc: number, e: any) => acc + (e.boxes || 0), 0),
      amount: wEntries.reduce((acc: number, e: any) => acc + (e.amount || 0), 0),
      isHourly: wEntries.some((e: any) => e.startTime)
    };
  }).filter((w: any) => w.boxes > 0 || w.amount > 0);

  const exportCSV = () => {
    const headers = ["Worker", "Type", "Details", "Amount", "Time", "Status"];
    const rows = visibleEntries.map((e: any) => [
      workers.find((w: any) => w.id === e.workerId)?.name || "Unknown",
      e.startTime ? "ساعة" : "بكسة",
      e.startTime ? `${e.startTime} - ${e.endTime}` : `${e.boxes} بكسة (${products.find((p: any) => p.id === e.productId)?.name || '?'})`,
      e.amount,
      e.date + " " + e.time,
      e.isPaid ? "تم الدفع" : "لم يدفع"
    ]);
    const csvContent = "\uFEFF" + [headers.join(","), ...rows.map((r: any) => r.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `khadra-report-${new Date().toLocaleDateString('en-CA')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrintPDF = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const date = new Date().toLocaleDateString('ar-JO', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    
    let pieceRows = pieceEntries.map((e: any) => `
      <tr>
        <td>${e.time}</td>
        <td>${e.workerName}</td>
        <td>${e.productName}</td>
        <td style="text-align:center">${e.boxes}</td>
        <td style="text-align:center">${e.amount}</td>
      </tr>
    `).join('');

    let hourlyRows = hourlyEntries.map((e: any) => `
      <tr>
        <td>${e.workerName}</td>
        <td>${e.startTime} - ${e.endTime}</td>
        <td style="text-align:center">${e.breakMinutes} د</td>
        <td style="text-align:center">${e.amount.toFixed(2)}</td>
      </tr>
    `).join('');

    printWindow.document.write(`
      <html dir="rtl">
        <head>
          <title>تقرير مشغل خضرا - ${date}</title>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@400;700&display=swap');
            body { font-family: 'Cairo', sans-serif; padding: 40px; color: #333; }
            .header { text-align: center; border-bottom: 2px solid #10b981; padding-bottom: 20px; margin-bottom: 30px; }
            .header h1 { color: #10b981; margin: 0; }
            .stats { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; margin-bottom: 30px; }
            .stat-card { border: 1px solid #eee; padding: 15px; border-radius: 10px; text-align: center; }
            .stat-card p { margin: 0; font-size: 12px; color: #666; font-weight: bold; }
            .stat-card h2 { margin: 5px 0 0; color: #10b981; }
            table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
            th { background: #f9fafb; padding: 12px; border: 1px solid #eee; text-align: right; font-size: 13px; }
            td { padding: 10px; border: 1px solid #eee; font-size: 13px; }
            .section-title { font-weight: bold; margin-bottom: 15px; color: #374151; border-right: 4px solid #10b981; padding-right: 10px; }
            @media print { .no-print { display: none; } }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>مشغل خضرا - Khadra Manager</h1>
            <p>تقرير إنجاز اليوم: ${date}</p>
          </div>

          <div class="stats">
            <div class="stat-card"><p>إجمالي البكسات</p><h2>${totalBoxes}</h2></div>
            <div class="stat-card"><p>أجور البكسات</p><h2>${totalPieceAmount} قرش</h2></div>
            <div class="stat-card"><p>أجور الساعة</p><h2>${totalHourlyAmount.toFixed(2)} د.أ</h2></div>
          </div>

          <div class="section-title">سجل إنتاج البكسة</div>
          <table>
            <thead>
              <tr><th>الوقت</th><th>العامل</th><th>المنتج</th><th>العدد</th><th>المبلغ</th></tr>
            </thead>
            <tbody>${pieceRows || '<tr><td colspan="5" style="text-align:center">لا يوجد بيانات</td></tr>'}</tbody>
          </table>

          <div class="section-title">سجل عمال الساعة</div>
          <table>
            <thead>
              <tr><th>العامل</th><th>الفترة</th><th>استراحة</th><th>المبلغ</th></tr>
            </thead>
            <tbody>${hourlyRows || '<tr><td colspan="4" style="text-align:center">لا يوجد بيانات</td></tr>'}</tbody>
          </table>

          <div style="margin-top: 50px; text-align: left; font-size: 12px; color: #999;">
            تم استخراج التقرير بتاريخ: ${new Date().toLocaleString('ar-JO')}
          </div>

          <script>window.print();</script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const sendWhatsApp = (workerId: string, name: string) => {
    const workerEntries = entries.filter((e: any) => e.workerId === workerId);
    const total = workerEntries.reduce((acc: number, curr: any) => acc + curr.amount, 0);
    const date = new Date().toLocaleDateString('ar-JO');
    
    let message = `*كشف إنتاج اليوم (${date})*\n`;
    message += `*الاسم:* ${name}\n\n`;
    
    workerEntries.forEach((e: any) => {
      if (e.startTime) {
        message += `• وردية ساعة: ${e.startTime} إلى ${e.endTime} = *${e.amount} د.أ*\n`;
      } else {
        const prod = products.find((p: any) => p.id === e.productId)?.name || '?';
        message += `• ${e.boxes} بكسة (${prod}) = *${e.amount} قرش*\n`;
      }
    });
    
    message += `\n*المجموع المستحق:* ${total} ${workerEntries[0]?.startTime ? 'دينار' : 'قرش'}`;
    
    window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, '_blank');
  };

  const handleDelete = async (id: string) => {
    if (sessionClosed) return;
    if (!confirm("هل أنت متأكد من حذف هذا السجل؟")) return;

    try {
      const res = await fetch(`/api/entries/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setEntries((prev: any[]) => prev.filter((e: any) => e.id !== id));
        toast.success("تم حذف السجل بنجاح");
      }
    } catch (error) {
      toast.error("فشل في الحذف");
    }
  };

  const getProductColor = (name: string) => {
    if (!name) return 'bg-gray-50 text-gray-600 border-gray-200';
    if (name.includes('بندورة')) return 'bg-red-50 text-red-600 border-red-200';
    if (name.includes('خيار')) return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    if (name.includes('فلفل')) return 'bg-orange-50 text-orange-600 border-orange-200';
    return 'bg-blue-50 text-blue-600 border-blue-200';
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-border p-4 shadow-sm">
          <p className="text-gray-500 text-[10px] uppercase font-bold mb-1">إجمالي البكسات</p>
          <p className="text-2xl font-bold text-primary">{totalBoxes}</p>
        </div>
        <div className="bg-white rounded-xl border border-border p-4 shadow-sm">
          <p className="text-gray-500 text-[10px] uppercase font-bold mb-1">أجور البكسات</p>
          <p className="text-2xl font-bold text-orange-600">{totalPieceAmount} <span className="text-xs font-normal">قرش</span></p>
        </div>
        <div className="bg-white rounded-xl border border-border p-4 shadow-sm col-span-2 lg:col-span-1">
          <p className="text-gray-500 text-[10px] uppercase font-bold mb-1">أجور عمال الساعة</p>
          <p className="text-2xl font-bold text-blue-600">{totalHourlyAmount.toFixed(2)} <span className="text-xs font-normal">دينار</span></p>
        </div>
      </div>

      {/* Piece Workers Table */}
      <div className="bg-white rounded-2xl border border-border shadow-panel overflow-hidden">
        <div className="p-5 bg-white border-b border-border flex justify-between items-center">
          <h3 className="font-bold text-lg text-gray-800">سجل إنجاز اليوم</h3>
          <div className="flex gap-2">
            <button 
              onClick={handlePrintPDF}
              className="flex items-center gap-1.5 px-4 py-2 bg-primary text-white rounded-xl text-xs font-bold shadow-sm hover:bg-primary-dark transition-all"
            >
              <Printer size={14} />
              إصدار كشف PDF
            </button>
            <button 
              onClick={exportCSV}
              className="flex items-center gap-1.5 px-4 py-2 bg-green-600 text-white rounded-xl text-xs font-bold shadow-sm hover:bg-green-700 transition-all"
            >
              <TableIcon size={14} />
              سجل Excel
            </button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-right text-sm">
            <thead className="bg-gray-50 text-gray-500 font-medium border-b border-border">
              <tr>
                <th className="px-4 py-3">الوقت</th>
                <th className="px-4 py-3">العامل</th>
                <th className="px-4 py-3">المنتج</th>
                <th className="px-4 py-3 text-center">العدد</th>
                <th className="px-4 py-3 text-center">المبلغ</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {pieceEntries.map((entry: any) => (
                <tr key={entry.id} className="hover:bg-gray-50/50">
                  <td className="px-4 py-3 text-xs text-gray-400 font-mono" dir="ltr">{entry.time}</td>
                  <td className="px-4 py-3 font-bold">{entry.workerName}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${getProductColor(entry.productName)}`}>
                      {entry.productName}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center font-bold text-primary">{entry.boxes}</td>
                  <td className="px-4 py-3 text-center font-bold text-orange-600">{entry.amount}</td>
                  <td className="px-4 py-3 text-center">
                    <button onClick={() => handleDelete(entry.id)} disabled={sessionClosed} className="p-1.5 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded"><Trash2 size={14}/></button>
                  </td>
                </tr>
              ))}
              {pieceEntries.length === 0 && (
                <tr><td colSpan={6} className="px-4 py-8 text-center text-gray-400">لا يوجد سجلات بكس اليوم</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Hourly Workers Table */}
      <div className="bg-white rounded-2xl border border-border shadow-panel overflow-hidden">
        <div className="p-4 border-b border-border bg-gray-50/50 flex items-center gap-2">
          <Timer size={18} className="text-blue-600" />
          <h3 className="font-bold text-gray-800">سجل عمال الساعة (المياومة)</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-right text-sm">
            <thead className="bg-gray-50 text-gray-500 font-medium border-b border-border">
              <tr>
                <th className="px-4 py-3">العامل</th>
                <th className="px-4 py-3">الفترة</th>
                <th className="px-4 py-3 text-center">استراحة</th>
                <th className="px-4 py-3 text-center">المبلغ</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {hourlyEntries.map((entry: any) => (
                <tr key={entry.id} className="hover:bg-gray-50/50">
                  <td className="px-4 py-3 font-bold">{entry.workerName}</td>
                  <td className="px-4 py-3 text-xs font-mono" dir="ltr">{entry.startTime} - {entry.endTime}</td>
                  <td className="px-4 py-3 text-center text-gray-500">{entry.breakMinutes} د</td>
                  <td className="px-4 py-3 text-center font-bold text-blue-600">{entry.amount.toFixed(2)}</td>
                  <td className="px-4 py-3 text-center">
                    <button onClick={() => handleDelete(entry.id)} disabled={sessionClosed} className="p-1.5 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded"><Trash2 size={14}/></button>
                  </td>
                </tr>
              ))}
              {hourlyEntries.length === 0 && (
                <tr><td colSpan={5} className="px-4 py-8 text-center text-gray-400">لا يوجد سجلات مياومة اليوم</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
