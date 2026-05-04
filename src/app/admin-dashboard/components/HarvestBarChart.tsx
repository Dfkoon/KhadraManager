"use client";

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

const data = [
  { name: "24/04", tomato: 400, cucumber: 240, pepper: 240 },
  { name: "25/04", tomato: 300, cucumber: 139, pepper: 221 },
  { name: "26/04", tomato: 200, cucumber: 980, pepper: 229 },
  { name: "27/04", tomato: 278, cucumber: 390, pepper: 200 },
  { name: "28/04", tomato: 189, cucumber: 480, pepper: 218 },
  { name: "29/04", tomato: 239, cucumber: 380, pepper: 250 },
  { name: "30/04", tomato: 349, cucumber: 430, pepper: 210 },
];

export default function HarvestBarChart() {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart
        data={data}
        margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
      >
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} dy={10} />
        <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} dx={-10} />
        <Tooltip 
          cursor={{ fill: 'transparent' }}
          contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
        />
        <Legend wrapperStyle={{ paddingTop: '20px' }} />
        <Bar dataKey="tomato" name="بندورة" fill="#ef4444" radius={[4, 4, 0, 0]} barSize={20} />
        <Bar dataKey="cucumber" name="خيار" fill="#10b981" radius={[4, 4, 0, 0]} barSize={20} />
        <Bar dataKey="pepper" name="فلفل" fill="#f97316" radius={[4, 4, 0, 0]} barSize={20} />
      </BarChart>
    </ResponsiveContainer>
  );
}
