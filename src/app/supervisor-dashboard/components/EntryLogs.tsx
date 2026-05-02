"use client";

import { Clock, CheckCircle, AlertCircle, Timer } from "lucide-react";

export default function EntryLogs({ entries }: any) {
  return (
    <div className="bg-card rounded-2xl border border-border shadow-panel overflow-hidden animate-fade-in">
      <div className="p-5 border-b border-border flex justify-between items-center bg-gray-50/50">
        <h3 className="font-bold text-gray-800">سجل الإدخالات اليومية</h3>
        <span className="text-xs text-gray-400">آخر {entries.length} سجلات</span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-right">
          <thead>
            <tr className="bg-gray-50 text-gray-500 text-xs uppercase font-bold">
              <th className="px-6 py-4">العامل</th>
              <th className="px-6 py-4">المنتج / النوع</th>
              <th className="px-6 py-4">الكمية / الوقت</th>
              <th className="px-6 py-4">المبلغ</th>
              <th className="px-6 py-4">الحالة</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {entries.map((entry: any) => (
              <tr key={entry.id} className="hover:bg-gray-50/80 transition-colors">
                <td className="px-6 py-4">
                  <div className="font-bold text-gray-800">{entry.workerName}</div>
                  <div className="text-[10px] text-gray-400 flex items-center gap-1">
                    <Clock size={10} /> {entry.time}
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-gray-600">
                  {entry.startTime ? (
                    <span className="flex items-center gap-1 text-blue-600 font-medium">
                      <Timer size={14} /> مياومة
                    </span>
                  ) : entry.productName}
                </td>
                <td className="px-6 py-4">
                  {entry.startTime ? (
                    <div className="text-xs font-mono">
                      {entry.startTime} - {entry.endTime}
                    </div>
                  ) : (
                    <span className="font-bold text-primary">{entry.boxes}</span>
                  )}
                </td>
                <td className="px-6 py-4 font-bold text-gray-700">{entry.amount}</td>
                <td className="px-6 py-4">
                  {entry.status === 'APPROVED' ? (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-green-100 text-green-700 text-[10px] font-bold">
                      <CheckCircle size={10} /> معتمد
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-100 text-amber-700 text-[10px] font-bold">
                      <AlertCircle size={10} /> معلق
                    </span>
                  )}
                </td>
              </tr>
            ))}
            {entries.length === 0 && (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center text-gray-400">لا يوجد سجلات لهذا اليوم</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
