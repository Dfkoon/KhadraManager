"use client";

import { CheckCircle, AlertCircle, Clock, Package } from "lucide-react";
import { toast } from "sonner";

export default function ApprovalsPanel({ pendingEntries, setEntries }: any) {
  const handleApprove = async (entryId: string) => {
    try {
      const res = await fetch('/api/entries/approve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ entryIds: [entryId] })
      });
      
      if (res.ok) {
        setEntries((prev: any) => 
          prev.map((e: any) => e.id === entryId ? { ...e, status: 'APPROVED' } : e)
        );
        toast.success("تم اعتماد الكمية بنجاح");
      }
    } catch (error) {
      toast.error("فشل الاعتماد");
    }
  };

  const handleApproveAll = async () => {
    const ids = pendingEntries.map((e: any) => e.id);
    if (ids.length === 0) return;

    try {
      const res = await fetch('/api/entries/approve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ entryIds: ids })
      });
      
      if (res.ok) {
        setEntries((prev: any) => 
          prev.map((e: any) => ids.includes(e.id) ? { ...e, status: 'APPROVED' } : e)
        );
        toast.success(`تم اعتماد ${ids.length} إدخالات بنجاح`);
      }
    } catch (error) {
      toast.error("فشل الاعتماد الجماعي");
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-border shadow-panel overflow-hidden animate-fade-in">
      <div className="p-5 bg-gradient-to-r from-amber-500 to-orange-600 text-white flex justify-between items-center">
        <h3 className="font-bold text-lg flex items-center gap-2">
          <AlertCircle size={20} />
          بانتظار الموافقة ({pendingEntries.length})
        </h3>
        {pendingEntries.length > 0 && (
          <button 
            onClick={handleApproveAll}
            className="text-xs bg-white text-orange-600 font-bold px-4 py-1.5 rounded-full hover:bg-orange-50 transition-colors"
          >
            اعتماد الكل
          </button>
        )}
      </div>

      <div className="divide-y divide-border">
        {pendingEntries.map((entry: any) => (
          <div key={entry.id} className="p-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
            <div className="flex gap-3 items-center">
              <div className="w-10 h-10 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center">
                <Package size={20} />
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-gray-800">{entry.workerName}</span>
                <span className="text-xs text-gray-500">
                  {entry.boxes} بكسة {entry.productName} • بواسطة {entry.supervisorName}
                </span>
              </div>
            </div>

            <div className="flex flex-col items-end gap-2">
              <span className="text-xs font-mono text-gray-400 flex items-center gap-1">
                <Clock size={12} /> {entry.time}
              </span>
              <button
                onClick={() => handleApprove(entry.id)}
                className="bg-green-100 text-green-700 hover:bg-green-200 px-3 py-1 rounded-lg text-sm font-bold transition-colors flex items-center gap-1"
              >
                <CheckCircle size={16} />
                اعتماد
              </button>
            </div>
          </div>
        ))}

        {pendingEntries.length === 0 && (
          <div className="p-12 text-center flex flex-col items-center justify-center gap-3">
            <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center text-gray-300">
              <CheckCircle size={32} />
            </div>
            <p className="text-gray-400 font-medium text-lg">لا يوجد أعداد معلقة حالياً</p>
          </div>
        )}
      </div>
    </div>
  );
}
