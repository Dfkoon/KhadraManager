"use client";

import { TrendingUp, Users, Package, AlertCircle, CheckCircle2 } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";

export default function AdminOverviewPanel({ supervisors, entries }: any) {
  const approvedEntries = entries.filter((e: any) => e.status === 'APPROVED');
  const pendingEntries = entries.filter((e: any) => e.status === 'PENDING');

  const totalApprovedAmount = approvedEntries.reduce((acc: number, e: any) => acc + e.amount, 0);
  const totalPendingAmount = pendingEntries.reduce((acc: number, e: any) => acc + e.amount, 0);
  const totalBoxes = approvedEntries.reduce((acc: number, e: any) => acc + (e.boxes || 0), 0);

  const stats = [
    { title: "إجمالي الأجور المعتمدة", value: `${totalApprovedAmount} قرش`, icon: <TrendingUp className="text-green-600" />, trend: "+12.5%", color: "bg-green-50" },
    { title: "أعداد بانتظار الاعتماد", value: pendingEntries.length, icon: <AlertCircle className="text-amber-600" />, sub: `${totalPendingAmount} قرش معلق`, color: "bg-amber-50" },
    { title: "إجمالي البكسات (المعتمدة)", value: totalBoxes, icon: <Package className="text-blue-600" />, trend: "+5.2%", color: "bg-blue-50" },
    { title: "عدد المشرفين والمدخلين", value: supervisors.length, icon: <Users className="text-purple-600" />, color: "bg-purple-50" },
  ];

  // Logic for Chart: Aggregate by product
  const productStats: any = {};
  approvedEntries.forEach((e: any) => {
    if (e.productName) {
      productStats[e.productName] = (productStats[e.productName] || 0) + (e.boxes || 0);
    }
  });

  const chartData = Object.keys(productStats).map(name => ({
    name,
    value: productStats[name]
  }));

  const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6'];

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <div key={i} className={`p-6 rounded-2xl border border-border shadow-panel ${stat.color} transition-transform hover:scale-[1.02]`}>
            <div className="flex justify-between items-start mb-4">
              <div className="p-3 rounded-xl bg-white shadow-sm">
                {stat.icon}
              </div>
              {stat.trend && (
                <span className="text-xs font-bold text-green-600 bg-green-100 px-2 py-1 rounded-lg">
                  {stat.trend}
                </span>
              )}
            </div>
            <p className="text-gray-500 text-sm mb-1">{stat.title}</p>
            <p className="text-2xl font-bold text-gray-800">{stat.value}</p>
            {stat.sub && <p className="text-xs text-amber-600 mt-1 font-medium">{stat.sub}</p>}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-card rounded-2xl border border-border shadow-panel p-6">
          <h3 className="font-bold text-lg mb-6 flex items-center gap-2">
            <TrendingUp size={20} className="text-primary" />
            إنتاجية المزرعة (حسب المنتج)
          </h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                <Tooltip 
                  cursor={{fill: '#f8fafc'}}
                  contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)'}}
                />
                <Bar dataKey="value" radius={[6, 6, 0, 0]} barSize={40}>
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-card rounded-2xl border border-border shadow-panel p-6">
          <h3 className="font-bold text-lg mb-6 flex items-center gap-2">
            <CheckCircle2 size={20} className="text-primary" />
            نشاط المشرفين الأخير
          </h3>
          <div className="space-y-4">
            {supervisors.slice(0, 5).map((sup: any) => (
              <div key={sup.id} className="flex items-center justify-between p-3 rounded-xl bg-gray-50 border border-border/50">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-xs">
                    {sup.name.charAt(0)}
                  </div>
                  <div>
                    <p className="font-bold text-sm text-gray-800">{sup.name}</p>
                    <p className="text-[10px] text-gray-400">{sup.role === 'HEAD_SUPERVISOR' ? 'مسؤول مشرفين' : 'مدخل أعداد'}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs font-bold text-primary">نشط</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
