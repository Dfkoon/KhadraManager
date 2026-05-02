"use client";

import { useState, useEffect } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, AreaChart, Area } from "recharts";
import { Calendar, TrendingUp, DollarSign, Package, Filter, Download } from "lucide-react";
import { toast } from "sonner";

export default function ReportsPanel({ sessionClosed }: any) {
  const [days, setDays] = useState(7);
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, [days]);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/reports?days=${days}`);
      if (res.ok) {
        const result = await res.json();
        setData(result);
      }
    } catch (error) {
      toast.error("فشل في تحميل التقارير");
    } finally {
      setIsLoading(false);
    }
  };

  const totalWages = data.reduce((acc, curr: any) => acc + curr.wages, 0);
  const totalBoxes = data.reduce((acc, curr: any) => acc + curr.boxes, 0);
  const totalExpenses = data.reduce((acc, curr: any) => acc + curr.expenses, 0);

  return (
    <div className="space-y-6 animate-fade-in pb-20">
      {/* Header & Filter */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-5 rounded-2xl border border-border shadow-sm">
        <div>
          <h3 className="font-bold text-xl flex items-center gap-2 text-gray-800">
            <TrendingUp className="text-primary" size={24} />
            التقارير والإحصائيات المالية
          </h3>
          <p className="text-sm text-gray-500 mt-1">نظرة عامة على أداء المشغل والإنتاج</p>
        </div>

        <div className="flex items-center gap-2 bg-gray-50 p-1 rounded-xl border border-border">
          {[7, 14, 30].map((d) => (
            <button
              key={d}
              onClick={() => setDays(d)}
              className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${
                days === d ? "bg-white text-primary shadow-sm" : "text-gray-400 hover:text-gray-600"
              }`}
            >
              آخر {d === 7 ? "أسبوع" : d === 14 ? "أسبوعين" : "شهر"}
            </button>
          ))}
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-emerald-600 p-5 rounded-2xl text-white shadow-lg">
          <p className="text-emerald-100 text-xs font-bold uppercase">إجمالي الإنتاج</p>
          <h4 className="text-2xl font-black mt-1">{totalBoxes.toLocaleString()} <span className="text-sm font-normal">بكسة</span></h4>
        </div>

        <div className="bg-blue-600 p-5 rounded-2xl text-white shadow-lg">
          <p className="text-blue-100 text-xs font-bold uppercase">إجمالي الأجور</p>
          <h4 className="text-2xl font-black mt-1">{totalWages.toLocaleString()} <span className="text-sm font-normal">د.أ</span></h4>
        </div>

        <div className="bg-rose-600 p-5 rounded-2xl text-white shadow-lg">
          <p className="text-rose-100 text-xs font-bold uppercase">إجمالي المصاريف</p>
          <h4 className="text-2xl font-black mt-1">{totalExpenses.toLocaleString()} <span className="text-sm font-normal">د.أ</span></h4>
        </div>

        <div className="bg-white border border-border p-5 rounded-2xl shadow-sm">
          <p className="text-gray-400 text-xs font-bold uppercase">صافي التدفق</p>
          <h4 className={`text-2xl font-black mt-1 ${(totalWages + totalExpenses) > 0 ? 'text-gray-800' : 'text-gray-400'}`}>
            -{(totalWages + totalExpenses).toLocaleString()} <span className="text-sm font-normal">د.أ</span>
          </h4>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Production Chart */}
        <div className="bg-white p-6 rounded-2xl border border-border shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <h4 className="font-bold text-gray-800 flex items-center gap-2">
              <Package size={18} className="text-emerald-500" />
              نمو الإنتاج (بكسات)
            </h4>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data}>
                <defs>
                  <linearGradient id="colorBoxes" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                <XAxis 
                  dataKey="date" 
                  tickFormatter={(str) => str.split('-').slice(1).reverse().join('/')}
                  tick={{ fontSize: 10 }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10 }} />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                  labelFormatter={(str) => `التاريخ: ${str}`}
                />
                <Area type="monotone" dataKey="boxes" name="البكسات" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorBoxes)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Expenses vs Wages Chart */}
        <div className="bg-white p-6 rounded-2xl border border-border shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <h4 className="font-bold text-gray-800 flex items-center gap-2">
              <DollarSign size={18} className="text-blue-500" />
              الأجور vs المصاريف
            </h4>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                <XAxis 
                  dataKey="date" 
                  tickFormatter={(str) => str.split('-').slice(1).reverse().join('/')}
                  tick={{ fontSize: 10 }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10 }} />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                  labelFormatter={(str) => `التاريخ: ${str}`}
                />
                <Bar dataKey="wages" name="الأجور" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={15} />
                <Bar dataKey="expenses" name="المصاريف" fill="#f43f5e" radius={[4, 4, 0, 0]} barSize={15} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
      
      {isLoading && (
        <div className="absolute inset-0 bg-white/50 flex items-center justify-center rounded-2xl z-10">
          <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}
    </div>
  );
}
