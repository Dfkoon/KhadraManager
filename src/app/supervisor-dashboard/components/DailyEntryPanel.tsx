"use client";

import { useState } from "react";
import { Plus, Package, Minus, Clock, Timer, QrCode } from "lucide-react";
import { toast } from "sonner";
import QRScanner from "./QRScanner";

export default function DailyEntryPanel({ workers, products, entries, setEntries, sessionClosed, user }: any) {
  const [selectedWorker, setSelectedWorker] = useState("");
  const [showScanner, setShowScanner] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState("");
  const [boxes, setBoxes] = useState<number | "">("");
  
  // For Hourly workers
  const [startTime, setStartTime] = useState("08:00");
  const [endTime, setEndTime] = useState("16:00");
  const [breakMinutes, setBreakMinutes] = useState(60);

  const worker = workers.find((w: any) => w.id === selectedWorker);
  const isHourly = worker?.workerType === 'HOURLY';
  
  const currentProduct = products.find((p: any) => p.id === selectedProduct);
  
  const calculatePieceAmount = () => {
    return currentProduct && boxes ? currentProduct.price * Number(boxes) : 0;
  };

  const calculateHourlyAmount = () => {
    if (!worker?.hourlyRate || !startTime || !endTime) return 0;
    const startMins = parseInt(startTime.split(':')[0]) * 60 + parseInt(startTime.split(':')[1]);
    const endMins = parseInt(endTime.split(':')[0]) * 60 + parseInt(endTime.split(':')[1]);
    const diffHours = (endMins - startMins - breakMinutes) / 60;
    return Math.max(0, diffHours * worker.hourlyRate);
  };

  const calculatedAmount = isHourly ? calculateHourlyAmount() : calculatePieceAmount();
  const displayAmount = isHourly ? calculatedAmount.toFixed(2) : calculatedAmount.toString();

  const handleBoxesChange = (amount: number) => {
    if (sessionClosed) return;
    if (typeof window !== "undefined" && navigator.vibrate) navigator.vibrate(50);
    setBoxes((prev) => {
      const current = prev === "" ? 0 : Number(prev);
      const next = current + amount;
      return next > 0 ? next : "";
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (sessionClosed) {
      toast.error("الجلسة مغلقة");
      return;
    }
    
    if (!selectedWorker) {
      toast.error("يرجى اختيار العامل");
      return;
    }

    const payload: any = {
      workerId: selectedWorker,
      date: new Date().toLocaleDateString('en-CA'),
      time: new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' }),
      supervisorId: user?.id,
      status: user?.role === 'CLERK' ? 'PENDING' : 'APPROVED'
    };

    if (isHourly) {
      const [startH, startM] = startTime.split(':').map(Number);
      const [endH, endM] = endTime.split(':').map(Number);
      if (endH * 60 + endM <= startH * 60 + startM + breakMinutes) {
        toast.error("وقت الانتهاء يجب أن يكون بعد وقت البدء بمدة كافية تشمل الاستراحة");
        return;
      }
      payload.startTime = startTime;
      payload.endTime = endTime;
      payload.breakMinutes = breakMinutes;
      payload.amount = calculatedAmount;
    } else {
      if (!selectedProduct || !boxes || Number(boxes) < 1) {
        toast.error("يرجى اختيار المنتج والكمية");
        return;
      }
      payload.productId = selectedProduct;
      payload.boxes = Number(boxes);
      payload.amount = calculatedAmount;
    }

    try {
      const res = await fetch('/api/entries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      
      if (res.ok) {
        const savedEntry = await res.json();
        // Optimistically update or re-fetch (simplifying here by updating local state)
        // If it was an increment, we'd need to handle that, but for now let's just toast and clear
        setEntries([savedEntry, ...entries.filter((e: any) => e.id !== savedEntry.id)]);
        toast.success(user?.role === 'CLERK' ? "تم إرسال الكمية للمراجعة" : "تم تسجيل الحصاد بنجاح");
        setBoxes("");
        if (typeof window !== "undefined" && navigator.vibrate) navigator.vibrate([100, 50, 100]);
      }
    } catch (err) {
      toast.error("فشل في حفظ البيانات");
    }
  };



  const handleScan = (data: string) => {
    // Expected format: W-1234567 or similar
    const worker = workers.find((w: any) => w.qrCode === data || w.id === data);
    if (worker) {
      setSelectedWorker(worker.id);
      toast.success(`تم اختيار: ${worker.name}`);
    } else {
      toast.error("كود غير معروف");
    }
  };

  return (
    <div className="bg-card rounded-2xl border border-border shadow-panel overflow-hidden animate-fade-in">
      {showScanner && <QRScanner onScan={handleScan} onClose={() => setShowScanner(false)} />}
      
      <div className="p-5 bg-gradient-primary text-white">
        <div className="flex justify-between items-center mb-2">
          <h3 className="font-bold text-lg flex items-center gap-2">
            <Package size={20} />
            تسجيل {isHourly ? 'ساعات العمل' : 'الحصاد'}
          </h3>
          <span className="text-xs bg-white/20 px-2 py-1 rounded text-white font-medium">
            {user?.role === 'CLERK' ? 'وضع مدخل أعداد' : 'وضع مسؤول'}
          </span>
        </div>
        <div className="flex justify-between items-end mt-4">
          <span className="text-white/80 text-sm">المبلغ المستحق</span>
          <span className="text-3xl font-bold">{displayAmount} <span className="text-lg font-normal opacity-80">{isHourly ? 'دينار' : 'قرش'}</span></span>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="p-6 space-y-5">
        <div>
          <div className="flex justify-between items-center mb-2">
            <label className="block text-sm font-medium text-gray-700">اختيار اسم العامل</label>
            <button 
              type="button" 
              onClick={() => setShowScanner(true)}
              className="text-primary text-xs font-bold flex items-center gap-1 hover:underline"
            >
              <QrCode size={14} /> مسح الكود
            </button>
          </div>
          <select
            value={selectedWorker}
            onChange={(e) => setSelectedWorker(e.target.value)}
            disabled={sessionClosed}
            className="w-full px-4 py-3.5 rounded-xl border border-border bg-gray-50 focus:bg-white focus:ring-ring outline-none text-base"
          >
            <option value="">-- اختر اسم العامل --</option>
            {workers.map((w: any) => <option key={w.id} value={w.id}>{w.name} ({w.workerType === 'PIECE' ? 'بكسة' : 'ساعة'})</option>)}
          </select>
        </div>

        {isHourly ? (
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">وقت البدء</label>
              <input 
                type="time" 
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-border bg-gray-50 focus:bg-white outline-none" 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">وقت الانتهاء</label>
              <input 
                type="time" 
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-border bg-gray-50 focus:bg-white outline-none" 
              />
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">الاستراحة (بالدقائق)</label>
              <input 
                type="number" 
                value={breakMinutes}
                onChange={(e) => setBreakMinutes(Number(e.target.value))}
                className="w-full px-4 py-3 rounded-xl border border-border bg-gray-50 focus:bg-white outline-none" 
              />
            </div>
          </div>
        ) : (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">نوع المنتج</label>
              <select
                value={selectedProduct}
                onChange={(e) => setSelectedProduct(e.target.value)}
                disabled={sessionClosed}
                className="w-full px-4 py-3.5 rounded-xl border border-border bg-gray-50 focus:bg-white outline-none"
              >
                <option value="">-- اختر المنتج --</option>
                {products.map((p: any) => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">عدد البكسات</label>
              <div className="flex items-center gap-3">
                <button type="button" onClick={() => handleBoxesChange(-1)} className="w-14 h-14 rounded-xl bg-gray-100 border border-border flex items-center justify-center text-gray-600"><Minus /></button>
                <input
                  type="number"
                  inputMode="numeric"
                  value={boxes}
                  onChange={(e) => setBoxes(e.target.value === "" ? "" : Number(e.target.value))}
                  className="w-full h-14 text-center text-2xl font-bold rounded-xl border border-border bg-white"
                  placeholder="0"
                />
                <button type="button" onClick={() => handleBoxesChange(1)} className="w-14 h-14 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary"><Plus /></button>
              </div>
            </div>
          </>
        )}

        <button
          type="submit"
          disabled={sessionClosed}
          className="w-full mt-2 h-14 bg-gradient-primary text-white rounded-xl font-bold flex items-center justify-center gap-2 shadow-elevated"
        >
          {user?.role === 'CLERK' ? 'إرسال للاعتماد' : 'تسجيل واعتماد'}
        </button>
      </form>
    </div>
  );
}
