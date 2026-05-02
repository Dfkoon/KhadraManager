"use client";

import { useState } from "react";
import { Plus, Search, Trash2, UserPlus, Timer, Package, Smartphone, Edit2, Check, X, QrCode, Printer } from "lucide-react";
import { toast } from "sonner";
import QRCode from "react-qr-code";

export default function WorkersPanel({ workers, setWorkers, sessionClosed }: any) {
  const [newWorkerName, setNewWorkerName] = useState("");
  const [workerType, setWorkerType] = useState<"PIECE" | "HOURLY">("PIECE");
  const [hourlyRate, setHourlyRate] = useState<number | "">("");
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  
  // QR View State
  const [viewingQR, setViewingQR] = useState<any>(null);

  // Edit State
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editType, setEditType] = useState<"PIECE" | "HOURLY">("PIECE");
  const [editRate, setEditRate] = useState<number | "">("");

  const handleAddWorker = async (e: React.FormEvent) => {
    e.preventDefault();
    if (sessionClosed || isLoading) return;
    if (!newWorkerName.trim()) return;
    if (workerType === "HOURLY" && !hourlyRate) {
      toast.error("يرجى إدخال أجرة الساعة");
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch('/api/workers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newWorkerName,
          workerType,
          hourlyRate: workerType === "HOURLY" ? Number(hourlyRate) : null,
          qrCode: `W-${Date.now()}`
        })
      });

      if (res.ok) {
        const saved = await res.json();
        setWorkers([...workers, saved]);
        setNewWorkerName("");
        setHourlyRate("");
        setWorkerType("PIECE");
        toast.success("تمت إضافة العامل بنجاح");
      }
    } catch (error) {
      toast.error("فشل في إضافة العامل");
    } finally {
      setIsLoading(false);
    }
  };

  const startEdit = (worker: any) => {
    setEditingId(worker.id);
    setEditName(worker.name);
    setEditType(worker.workerType);
    setEditRate(worker.hourlyRate || "");
  };

  const handleUpdate = async (id: string) => {
    try {
      const res = await fetch(`/api/workers/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: editName,
          workerType: editType,
          hourlyRate: editRate
        })
      });

      if (res.ok) {
        const updated = await res.json();
        setWorkers(workers.map((w: any) => w.id === id ? updated : w));
        setEditingId(null);
        toast.success("تم تحديث بيانات العامل");
      }
    } catch (error) {
      toast.error("فشل في التعديل");
    }
  };

  const handleDelete = async (id: string) => {
    if (sessionClosed || !confirm("هل أنت متأكد من حذف هذا العامل؟")) return;
    
    try {
      const res = await fetch(`/api/workers/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setWorkers(workers.filter((w: any) => w.id !== id));
        toast.success("تم حذف العامل");
      }
    } catch (error) {
      toast.error("فشل في حذف العامل");
    }
  };

  const filteredWorkers = workers.filter((w: any) => w.name.toLowerCase().includes(searchTerm.toLowerCase()));
  const hourlyWorkers = filteredWorkers.filter((w: any) => w.workerType === "HOURLY");
  const pieceWorkers = filteredWorkers.filter((w: any) => w.workerType === "PIECE");

  const renderWorkerRow = (worker: any) => (
    <div key={worker.id} className="p-4 flex flex-col md:flex-row md:items-center justify-between hover:bg-gray-50/50 transition-colors gap-4">
      {editingId === worker.id ? (
        <div className="flex-1 space-y-3 animate-in fade-in slide-in-from-left-2">
          <input value={editName} onChange={(e)=>setEditName(e.target.value)} className="w-full px-3 py-2 border rounded-lg outline-none" />
          <div className="flex gap-2">
            <select value={editType} onChange={(e)=>setEditType(e.target.value as any)} className="flex-1 px-3 py-2 border rounded-lg outline-none text-sm">
               <option value="PIECE">بالبكسة</option>
               <option value="HOURLY">بالساعة</option>
            </select>
            {editType === 'HOURLY' && (
              <input type="number" value={editRate} onChange={(e)=>setEditRate(Number(e.target.value))} className="w-24 px-3 py-2 border rounded-lg outline-none text-sm" placeholder="الأجرة" />
            )}
          </div>
          <div className="flex gap-2">
            <button onClick={() => handleUpdate(worker.id)} className="flex-1 bg-green-600 text-white py-2 rounded-lg font-bold flex items-center justify-center gap-1"><Check size={16}/> حفظ</button>
            <button onClick={() => setEditingId(null)} className="flex-1 bg-gray-200 text-gray-700 py-2 rounded-lg font-bold flex items-center justify-center gap-1"><X size={16}/> إلغاء</button>
          </div>
        </div>
      ) : (
        <>
          <div className="flex items-center gap-4">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold ${worker.workerType === 'HOURLY' ? 'bg-orange-500' : 'bg-blue-500'}`}>
              {worker.workerType === 'HOURLY' ? <Timer size={18}/> : <Package size={18}/>}
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-foreground">{worker.name}</span>
              <div className="flex items-center gap-2">
                <span className="text-[10px] bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">{worker.workerType === 'HOURLY' ? `ساعة (${worker.hourlyRate} دينار)` : 'نظام البكسة'}</span>
                <span className="text-[10px] text-gray-400 font-mono">{worker.id}</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button 
              onClick={() => setViewingQR(worker)}
              className="p-2 text-primary hover:bg-primary/10 rounded-xl"
              title="عرض الكود"
            >
              <QrCode size={18} />
            </button>
            <button 
              onClick={() => {
                const msg = encodeURIComponent(`مرحباً ${worker.name}،\nكيف حالك؟ هذا تذكير من مشغل خضرا.`);
                window.open(`https://wa.me/?text=${msg}`, '_blank');
              }}
              className="p-2 text-green-600 hover:bg-green-50 rounded-xl"
            >
              <Smartphone size={18} />
            </button>
            <button 
              onClick={() => startEdit(worker)}
              className="p-2 text-blue-600 hover:bg-blue-50 rounded-xl"
            >
              <Edit2 size={18} />
            </button>
            <button 
              onClick={() => handleDelete(worker.id)}
              disabled={sessionClosed}
              className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-xl"
            >
              <Trash2 size={18} />
            </button>
          </div>
        </>
      )}
    </div>
  );

  return (
    <div className="space-y-6 animate-fade-in max-w-4xl mx-auto pb-24">
      {/* QR Viewer Modal */}
      {viewingQR && (
        <div className="fixed inset-0 z-[110] bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-8 max-w-sm w-full flex flex-col items-center gap-6 shadow-2xl animate-in zoom-in-95">
             <div className="text-center">
               <h4 className="text-xl font-bold text-gray-900">{viewingQR.name}</h4>
               <p className="text-sm text-gray-500 mt-1">كود التعريف الخاص بالعامل</p>
             </div>
             
             <div className="p-4 bg-white border-4 border-gray-50 rounded-2xl shadow-inner">
               <QRCode 
                 value={viewingQR.qrCode || viewingQR.id} 
                 size={200}
                 level="H"
               />
             </div>

             <div className="flex w-full gap-3">
               <button 
                 onClick={() => window.print()}
                 className="flex-1 bg-primary text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2"
               >
                 <Printer size={18} /> طباعة
               </button>
               <button 
                 onClick={() => setViewingQR(null)}
                 className="flex-1 bg-gray-100 text-gray-700 py-3 rounded-xl font-bold"
               >
                 إغلاق
               </button>
             </div>
          </div>
        </div>
      )}

      {/* Add Worker Form */}
      <div className="bg-white rounded-2xl border border-border shadow-panel overflow-hidden">
        <div className="p-5 bg-gradient-to-r from-green-600 to-emerald-700 text-white flex items-center gap-2">
          <UserPlus size={20} />
          <h3 className="font-bold text-lg">إضافة عامل جديد</h3>
        </div>
        
        <form onSubmit={handleAddWorker} className="p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="col-span-1 md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">اسم العامل</label>
              <input 
                value={newWorkerName}
                onChange={(e) => setNewWorkerName(e.target.value)}
                disabled={sessionClosed || isLoading}
                className="w-full px-4 py-3 rounded-xl border border-border bg-gray-50 focus:bg-white outline-none"
                placeholder="الاسم الكامل للعامل..."
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">نظام المحاسبة</label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setWorkerType("PIECE")}
                  className={`flex-1 py-3 rounded-xl border flex items-center justify-center gap-2 font-bold transition-all ${
                    workerType === "PIECE" ? "bg-primary/10 border-primary text-primary" : "bg-gray-50 border-border text-gray-400"
                  }`}
                >
                  <Package size={18} />
                  بالبكسة
                </button>
                <button
                  type="button"
                  onClick={() => setWorkerType("HOURLY")}
                  className={`flex-1 py-3 rounded-xl border flex items-center justify-center gap-2 font-bold transition-all ${
                    workerType === "HOURLY" ? "bg-primary/10 border-primary text-primary" : "bg-gray-50 border-border text-gray-400"
                  }`}
                >
                  <Timer size={18} />
                  بالساعة
                </button>
              </div>
            </div>

            {workerType === "HOURLY" && (
              <div className="animate-in slide-in-from-top-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">أجرة الساعة (دينار)</label>
                <input 
                  type="number"
                  step="0.01"
                  value={hourlyRate}
                  onChange={(e) => setHourlyRate(e.target.value === "" ? "" : Number(e.target.value))}
                  className="w-full px-4 py-3 rounded-xl border border-border bg-gray-50 focus:bg-white outline-none"
                  placeholder="مثلاً: 1.50"
                />
              </div>
            )}
          </div>

          <button 
            type="submit"
            disabled={sessionClosed || !newWorkerName.trim() || isLoading}
            className="w-full h-14 bg-gradient-primary text-white rounded-xl font-bold flex items-center justify-center gap-2 shadow-elevated disabled:opacity-50"
          >
            {isLoading ? "جاري الحفظ..." : "إضافة العامل للمشغل"}
          </button>
        </form>
      </div>

      <div className="bg-white p-4 rounded-2xl border border-border flex justify-between items-center shadow-sm">
        <h3 className="font-bold text-gray-800 flex items-center gap-2">
          <Search size={20} className="text-gray-400" />
          بحث سريع
        </h3>
        <input 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-xs w-full px-4 py-2 rounded-xl border border-border bg-gray-50 text-sm outline-none"
          placeholder="ابحث عن اسم العامل..."
        />
      </div>

      {/* Hourly Workers Section */}
      <div className="bg-card rounded-2xl border border-border shadow-panel overflow-hidden">
        <div className="p-4 border-b border-border bg-orange-50/50 flex items-center gap-2">
          <Timer size={20} className="text-orange-600" />
          <h3 className="font-bold text-lg text-orange-900">عمال المياومة (نظام الساعة) - {hourlyWorkers.length}</h3>
        </div>
        <div className="divide-y divide-border">
          {hourlyWorkers.map(renderWorkerRow)}
          {hourlyWorkers.length === 0 && (
            <div className="p-8 text-center text-gray-400">لا يوجد عمال مياومة حالياً</div>
          )}
        </div>
      </div>

      {/* Piece Workers Section */}
      <div className="bg-card rounded-2xl border border-border shadow-panel overflow-hidden">
        <div className="p-4 border-b border-border bg-blue-50/50 flex items-center gap-2">
          <Package size={20} className="text-blue-600" />
          <h3 className="font-bold text-lg text-blue-900">عمال الإنتاج (نظام البكسة) - {pieceWorkers.length}</h3>
        </div>
        <div className="divide-y divide-border">
          {pieceWorkers.map(renderWorkerRow)}
          {pieceWorkers.length === 0 && (
            <div className="p-8 text-center text-gray-400">لا يوجد عمال إنتاج حالياً</div>
          )}
        </div>
      </div>
    </div>
  );
}
