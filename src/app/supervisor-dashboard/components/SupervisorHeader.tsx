"use client";

import { Lock, Unlock, WifiOff, User, Clock, CheckCircle, X } from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "sonner";

export default function SupervisorHeader({ sessionClosed, setSessionClosed, entries, setEntries, user }: any) {
  const dateStr = new Date().toLocaleDateString('ar-EG', { year: 'numeric', month: 'long', day: 'numeric' });
  const [isOffline, setIsOffline] = useState(false);
  const [showBulkEndModal, setShowBulkEndModal] = useState(false);
  const [bulkEndTime, setBulkEndTime] = useState("16:00");
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    setIsOffline(!navigator.onLine);
    const handleOffline = () => setIsOffline(true);
    const handleOnline = () => setIsOffline(false);
    window.addEventListener('offline', handleOffline);
    window.addEventListener('online', handleOnline);
    return () => {
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('online', handleOnline);
    };
  }, []);
  
  const approvedEntries = entries.filter((e: any) => e.status === 'APPROVED');
  const totalBoxes = approvedEntries.reduce((acc: number, e: any) => acc + (e.boxes || 0), 0);
  const totalAmount = approvedEntries.reduce((acc: number, e: any) => acc + (e.amount || 0), 0);

  const isHead = user?.role === 'ADMIN' || user?.role === 'HEAD_SUPERVISOR';

  const handleCloseSessionClick = () => {
    if (sessionClosed) {
      setSessionClosed(false);
      return;
    }

    // Check for hourly entries missing end time
    const missingEndTimes = entries.filter((e: any) => e.startTime && !e.endTime);
    if (missingEndTimes.length > 0) {
      setShowBulkEndModal(true);
    } else {
      setSessionClosed(true);
      toast.success("تم إغلاق الجلسة بنجاح");
    }
  };

  const handleBulkUpdate = async () => {
    const missingEndTimes = entries.filter((e: any) => e.startTime && !e.endTime);
    const ids = missingEndTimes.map((e: any) => e.id);

    setIsUpdating(true);
    try {
      const res = await fetch('/api/entries/bulk-update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids, endTime: bulkEndTime })
      });

      if (res.ok) {
        toast.success(`تم تحديث ${ids.length} وردية وحساب الأجور بنجاح`);
        window.location.reload(); // Refresh to get updated amounts
      }
    } catch (error) {
      toast.error("فشل في التحديث الجماعي");
    } finally {
      setIsUpdating(false);
      setShowBulkEndModal(false);
    }
  };

  return (
    <header className="h-[65px] bg-white border-b border-border shadow-sm flex items-center justify-between px-4 md:px-6 z-10 sticky top-0">
      {/* Bulk End Time Modal */}
      {showBulkEndModal && (
        <div className="fixed inset-0 z-[100] bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl animate-in zoom-in-95">
             <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-gray-900">إنهاء ورديات الساعة</h3>
                <button onClick={() => setShowBulkEndModal(false)} className="text-gray-400 hover:text-gray-600"><X size={24}/></button>
             </div>
             
             <p className="text-gray-600 text-sm mb-6">يوجد عمال مياومة لم يتم تسجيل وقت مغادرتهم بعد. يرجى تحديد وقت المغادرة الموحد لاحتساب الأجور تلقائياً وإغلاق اليوم.</p>

             <div className="space-y-4">
               <div>
                 <label className="block text-sm font-bold text-gray-700 mb-2">وقت المغادرة (للجميع)</label>
                 <div className="relative">
                    <Clock className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                    <input 
                      type="time"
                      value={bulkEndTime}
                      onChange={(e) => setBulkEndTime(e.target.value)}
                      className="w-full bg-gray-50 border border-border rounded-xl py-4 pr-12 pl-4 text-xl font-bold text-gray-800 outline-none focus:ring-2 focus:ring-primary/20"
                    />
                 </div>
               </div>

               <div className="flex gap-3 pt-4">
                 <button 
                   onClick={handleBulkUpdate}
                   disabled={isUpdating}
                   className="flex-1 bg-primary text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg disabled:opacity-50"
                 >
                   {isUpdating ? "جاري الحفظ..." : "تأكيد وإنهاء اليوم"}
                   {!isUpdating && <CheckCircle size={20} />}
                 </button>
               </div>
             </div>
          </div>
        </div>
      )}

      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
          <User size={20} />
        </div>
        <div>
          <h2 className="font-bold text-foreground flex items-center gap-2 text-sm md:text-base">
            {user?.name || "المشرف"}
            {isOffline && (
              <span className="flex items-center gap-1 text-[10px] bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full border border-gray-200">
                <WifiOff size={10} /> غير متصل
              </span>
            )}
          </h2>
          <p className="text-[10px] md:text-xs text-gray-500">{user?.role === 'HEAD_SUPERVISOR' ? 'مسؤول مشرفين' : 'مدخل أعداد'} • {dateStr}</p>
        </div>
      </div>

      <div className="flex items-center gap-4 md:gap-6">
        <div className="flex items-center gap-3 md:gap-4 text-xs md:text-sm font-semibold text-gray-700">
          <div className="flex flex-col items-end">
            <span className="text-[9px] md:text-[10px] text-gray-500 uppercase">بكسات</span>
            <span>{totalBoxes}</span>
          </div>
          <div className="w-px h-6 md:h-8 bg-border"></div>
          <div className="flex flex-col items-end">
            <span className="text-[9px] md:text-[10px] text-gray-500 uppercase">الأجور</span>
            <span className="text-orange-600">{totalAmount.toLocaleString()} <span className="text-[10px]">د.أ</span></span>
          </div>
        </div>
        
        {isHead && (
          <button 
            onClick={handleCloseSessionClick}
            className={`flex items-center gap-2 px-3 md:px-4 py-2 rounded-xl text-xs md:text-sm font-bold transition-all ${
              sessionClosed 
                ? 'bg-amber-100 text-amber-700 border border-amber-200' 
                : 'bg-red-50 text-red-600 border border-red-200'
            }`}
          >
            {sessionClosed ? <Unlock size={14} /> : <Lock size={14} />}
            <span className="hidden sm:inline">{sessionClosed ? 'فتح الجلسة' : 'إغلاق الجلسة'}</span>
          </button>
        )}
      </div>
    </header>
  );
}
