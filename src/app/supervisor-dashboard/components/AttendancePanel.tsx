"use client";

import { useState } from "react";
import { UserCheck, UserX, Clock, Play, Square, Coffee, CheckSquare, Square as SquareIcon, AlertCircle } from "lucide-react";
import { toast } from "sonner";

export default function AttendancePanel({ workers, attendance, setAttendance, entries, setEntries }: any) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [breakMinutes, setBreakMinutes] = useState(30);
  const [startTime, setStartTime] = useState(new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }));
  const [endTime, setEndTime] = useState(new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }));
  
  const [selectedForStart, setSelectedForStart] = useState<string[]>([]);
  const [selectedForEnd, setSelectedForEnd] = useState<string[]>([]);

  const date = new Date().toLocaleDateString('en-CA');

  const hourlyWorkers = workers.filter((w: any) => w.workerType === 'HOURLY');
  const presentHourly = hourlyWorkers.filter((w: any) => 
    attendance.find((a: any) => a.workerId === w.id && a.status === 'PRESENT')
  );

  // Workers who are present but don't have an open entry today
  const notStarted = presentHourly.filter((w: any) => 
    !entries.find((e: any) => e.workerId === w.id && e.date === date && e.startTime && !e.endTime)
  );

  // Workers who have an open entry today
  const workingNow = entries.filter((e: any) => e.date === date && e.startTime && !e.endTime);

  const toggleSelectAllStart = () => {
    if (selectedForStart.length === notStarted.length) {
      setSelectedForStart([]);
    } else {
      setSelectedForStart(notStarted.map((w: any) => w.id));
    }
  };

  const toggleSelectAllEnd = () => {
    if (selectedForEnd.length === workingNow.length) {
      setSelectedForEnd([]);
    } else {
      setSelectedForEnd(workingNow.map((e: any) => e.workerId));
    }
  };

  const toggleAttendance = async (workerId: string, currentStatus: string) => {
    try {
      const newStatus = currentStatus === 'PRESENT' ? 'ABSENT' : 'PRESENT';
      const res = await fetch('/api/attendance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ workerId, date, status: newStatus })
      });

      if (res.ok) {
        const updated = await res.json();
        setAttendance(attendance.find((a: any) => a.workerId === workerId) 
          ? attendance.map((a: any) => a.workerId === workerId ? updated : a)
          : [...attendance, updated]
        );
        toast.success(`تم تسجيل ${newStatus === 'PRESENT' ? 'حضور' : 'غياب'} العامل`);
      }
    } catch (error) {
      toast.error("فشل في تحديث الحضور");
    }
  };

  const batchStartHourly = async () => {
    if (selectedForStart.length === 0) {
      toast.error("يرجى اختيار العمال المراد بدء ورديتهم");
      return;
    }

    setIsProcessing(true);
    try {
      for (const id of selectedForStart) {
        await fetch('/api/entries', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            workerId: id,
            date,
            time: startTime,
            startTime: startTime,
            status: 'PENDING',
          })
        });
      }
      toast.success(`تم بدء العمل لـ ${selectedForStart.length} عامل`);
      setSelectedForStart([]);
      window.location.reload();
    } catch (error) {
      toast.error("خطأ أثناء بدء الوردية");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleEndSelected = async () => {
    if (selectedForEnd.length === 0) return;
    
    // Validate Time: Ensure end time is after start time for each selected worker
    for (const workerId of selectedForEnd) {
      const entry = workingNow.find((e: any) => e.workerId === workerId);
      if (entry && entry.startTime) {
        const [startH, startM] = entry.startTime.split(':').map(Number);
        const [endH, endM] = endTime.split(':').map(Number);
        const startTotal = startH * 60 + startM;
        const endTotal = endH * 60 + endM;
        
        if (endTotal <= startTotal) {
          toast.error(`وقت الانتهاء يجب أن يكون بعد وقت البدء للعامل: ${entry.workerName}`);
          return;
        }
      }
    }

    if (!confirm(`هل أنت متأكد من إنهاء وردية ${selectedForEnd.length} عامل؟`)) return;
    
    setIsProcessing(true);
    try {
      const res = await fetch('/api/entries/batch-end', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          endTime, 
          breakMinutes,
          workerIds: selectedForEnd
        })
      });

      if (res.ok) {
        toast.success("تم إنهاء الوردية وحساب الأجور بنجاح");
        window.location.reload();
      }
    } catch (error) {
      toast.error("فشل في إنهاء الوردية");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-10 animate-fade-in max-w-5xl mx-auto pb-32">
      
      {/* Step 1: Attendance */}
      <section className="bg-white rounded-2xl border border-border shadow-panel overflow-hidden">
        <div className="p-5 border-b border-border bg-gray-50/50">
          <h3 className="font-bold text-lg flex items-center gap-2 text-gray-800">
            <UserCheck size={20} className="text-primary" />
            1. تحضير العمال (الكل)
          </h3>
          <p className="text-xs text-gray-400 mt-1">سجل حضور العمال قبل بدء أي عملية أخرى</p>
        </div>
        <div className="max-h-[400px] overflow-y-auto divide-y divide-border">
          {workers.map((worker: any) => {
            const status = attendance.find((a: any) => a.workerId === worker.id)?.status || 'ABSENT';
            return (
              <div key={worker.id} className="p-4 flex items-center justify-between hover:bg-gray-50/50 transition-colors">
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm ${status === 'PRESENT' ? 'bg-green-500 text-white shadow-lg' : 'bg-gray-100 text-gray-400'}`}>
                    {worker.name.charAt(0)}
                  </div>
                  <div>
                    <p className={`font-bold ${status === 'PRESENT' ? 'text-gray-900' : 'text-gray-400'}`}>{worker.name}</p>
                    <span className="text-[10px] bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">{worker.workerType === 'HOURLY' ? 'مياومة' : 'بالبكسة'}</span>
                  </div>
                </div>
                <button 
                  onClick={() => toggleAttendance(worker.id, status)}
                  className={`px-4 py-2 rounded-xl font-bold text-xs transition-all ${status === 'PRESENT' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-gray-50 text-gray-400 border border-gray-200'}`}
                >
                  {status === 'PRESENT' ? 'مداوم' : 'سجل حضور'}
                </button>
              </div>
            );
          })}
        </div>
      </section>

      {/* Step 2: Start Shift */}
      {notStarted.length > 0 && (
        <section className="bg-white rounded-3xl border-2 border-emerald-100 shadow-panel overflow-hidden">
          <div className="p-6 bg-emerald-600 text-white">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <Play size={24} fill="currentColor" />
                <div>
                  <h3 className="font-bold text-xl">2. بدء ساعة العمل</h3>
                  <p className="text-emerald-100 text-xs">حدد العمال ووقت البدء لتفعيل عداد الساعة</p>
                </div>
              </div>
              <div className="flex items-center gap-3 bg-white/10 p-2 rounded-2xl backdrop-blur-sm">
                <span className="text-xs font-bold">وقت البدء:</span>
                <input 
                  type="time" 
                  value={startTime} 
                  onChange={(e)=>setStartTime(e.target.value)} 
                  className="bg-white text-emerald-900 font-bold px-3 py-1.5 rounded-xl outline-none" 
                />
              </div>
            </div>
          </div>

          <div className="p-6 space-y-6">
            <div className="flex items-center justify-between bg-gray-50 p-4 rounded-2xl border border-border">
              <button 
                onClick={toggleSelectAllStart}
                className="flex items-center gap-2 px-4 py-2 bg-white border border-border rounded-xl text-sm font-bold hover:border-emerald-500 transition-colors"
              >
                {selectedForStart.length === notStarted.length ? <CheckSquare size={18} className="text-emerald-600"/> : <SquareIcon size={18} className="text-gray-400"/>}
                تحديد الكل / باستثناء
              </button>
              <span className="text-sm text-gray-500 font-medium">مختار: {selectedForStart.length}</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {notStarted.map((worker: any) => (
                <button 
                  key={worker.id}
                  onClick={() => setSelectedForStart(prev => prev.includes(worker.id) ? prev.filter(i => i !== worker.id) : [...prev, worker.id])}
                  className={`flex items-center gap-3 p-3 rounded-2xl border-2 transition-all text-right ${selectedForStart.includes(worker.id) ? 'border-emerald-500 bg-emerald-50/50 shadow-sm' : 'border-gray-100 bg-white hover:border-gray-200'}`}
                >
                  <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center ${selectedForStart.includes(worker.id) ? 'bg-emerald-500 border-emerald-500 text-white' : 'border-gray-200'}`}>
                    {selectedForStart.includes(worker.id) && <CheckSquare size={14}/>}
                  </div>
                  <span className="font-bold text-sm text-gray-700">{worker.name}</span>
                </button>
              ))}
            </div>

            <button 
              onClick={batchStartHourly}
              disabled={isProcessing || selectedForStart.length === 0}
              className="w-full bg-emerald-600 text-white p-4 rounded-2xl font-bold shadow-lg hover:bg-emerald-700 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
            >
              <Play size={20} fill="currentColor"/> تثبيت وقت البدء للمختارين
            </button>
          </div>
        </section>
      )}

      {/* Step 3: End Shift */}
      {workingNow.length > 0 && (
        <section className="bg-white rounded-3xl border-2 border-blue-100 shadow-panel overflow-hidden">
          <div className="p-6 bg-blue-600 text-white">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <Square size={24} fill="currentColor" />
                <div>
                  <h3 className="font-bold text-xl">3. إنهاء وردية المياومة</h3>
                  <p className="text-blue-100 text-xs">أغلق الوردية واحسب الأجور للمختارين</p>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-4">
                <div className="flex items-center gap-2 bg-white/10 p-2 rounded-2xl backdrop-blur-sm text-xs">
                  <span className="font-bold">وقت الانتهاء:</span>
                  <input type="time" value={endTime} onChange={(e)=>setEndTime(e.target.value)} className="bg-white text-blue-900 font-bold px-2 py-1 rounded-lg outline-none" />
                </div>
                <div className="flex items-center gap-2 bg-white/10 p-2 rounded-2xl backdrop-blur-sm text-xs">
                  <span className="font-bold">استراحة:</span>
                  <input type="number" value={breakMinutes} onChange={(e)=>setBreakMinutes(Number(e.target.value))} className="w-12 bg-white text-blue-900 font-bold px-2 py-1 rounded-lg outline-none text-center" />
                  <span>د</span>
                </div>
              </div>
            </div>
          </div>

          <div className="p-6 space-y-6">
            <div className="flex items-center justify-between bg-gray-50 p-4 rounded-2xl border border-border">
              <button 
                onClick={toggleSelectAllEnd}
                className="flex items-center gap-2 px-4 py-2 bg-white border border-border rounded-xl text-sm font-bold hover:border-blue-500 transition-colors"
              >
                {selectedForEnd.length === workingNow.length ? <CheckSquare size={18} className="text-blue-600"/> : <SquareIcon size={18} className="text-gray-400"/>}
                تحديد الكل / باستثناء
              </button>
              <span className="text-sm text-gray-500 font-medium">مختار: {selectedForEnd.length}</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {workingNow.map((entry: any) => (
                <button 
                  key={entry.id}
                  onClick={() => setSelectedForEnd(prev => prev.includes(entry.workerId) ? prev.filter(i => i !== entry.workerId) : [...prev, entry.workerId])}
                  className={`flex flex-col gap-1 p-3 rounded-2xl border-2 transition-all text-right ${selectedForEnd.includes(entry.workerId) ? 'border-blue-500 bg-blue-50/50 shadow-sm' : 'border-gray-100 bg-white hover:border-gray-200'}`}
                >
                  <div className="flex items-center gap-2">
                    <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center ${selectedForEnd.includes(entry.workerId) ? 'bg-blue-500 border-blue-500 text-white' : 'border-gray-200'}`}>
                      {selectedForEnd.includes(entry.workerId) && <CheckSquare size={14}/>}
                    </div>
                    <span className="font-bold text-sm text-gray-700">{entry.workerName}</span>
                  </div>
                  <div className="flex items-center gap-1 mr-7 text-[10px] text-gray-400">
                    <Clock size={10}/> بدأ: {entry.startTime}
                  </div>
                </button>
              ))}
            </div>

            <button 
              onClick={batchEndHourly}
              disabled={isProcessing || selectedForEnd.length === 0}
              className="w-full flex items-center justify-center gap-3 bg-red-600 text-white p-4 rounded-2xl font-bold shadow-lg hover:bg-red-700 transition-all"
            >
              <Square size={20} fill="currentColor" /> إنهاء وردية المختارين وحساب الأجور
            </button>
          </div>
        </section>
      )}

      {workingNow.length === 0 && notStarted.length === 0 && presentHourly.length > 0 && (
        <div className="bg-blue-50 border-2 border-blue-100 p-8 rounded-3xl text-center space-y-3">
          <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto">
            <Clock size={32} />
          </div>
          <h4 className="font-bold text-blue-900 text-lg">تم الانتهاء من جميع الورديات</h4>
          <p className="text-blue-600 text-sm">تم إغلاق كافة ساعات العمل لعمال المياومة لهذا اليوم.</p>
        </div>
      )}

    </div>
  );
}
