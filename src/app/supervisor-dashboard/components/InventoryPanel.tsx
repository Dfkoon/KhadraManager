"use client";

import { useState, useEffect } from "react";
import { Archive, Plus, Trash2, AlertTriangle, Package, Minus } from "lucide-react";
import { toast } from "sonner";

export default function InventoryPanel() {
  const [items, setItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [newItem, setNewItem] = useState({ name: "", quantity: "", minQuantity: "10", unit: "قطعة" });

  useEffect(() => {
    fetchInventory();
  }, []);

  const fetchInventory = async () => {
    try {
      const res = await fetch('/api/inventory');
      if (res.ok) setItems(await res.json());
    } finally {
      setIsLoading(false);
    }
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItem.name || !newItem.quantity) return;

    try {
      const res = await fetch('/api/inventory', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newItem)
      });
      if (res.ok) {
        const saved = await res.json();
        setItems([...items, saved]);
        setNewItem({ name: "", quantity: "", minQuantity: "10", unit: "قطعة" });
        toast.success("تمت إضافة المادة بنجاح");
      }
    } catch (error) {
      toast.error("فشل في الإضافة");
    }
  };

  const updateQuantity = async (id: string, newQty: number) => {
    try {
      const res = await fetch(`/api/inventory/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ quantity: newQty })
      });
      if (res.ok) {
        setItems(items.map((i: any) => i.id === id ? { ...i, quantity: newQty } : i));
      }
    } catch (error) {
      toast.error("فشل التحديث");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("هل أنت متأكد؟")) return;
    try {
      const res = await fetch(`/api/inventory/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setItems(items.filter((i: any) => i.id !== id));
        toast.success("تم الحذف");
      }
    } catch (error) {
      toast.error("فشل الحذف");
    }
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-4xl mx-auto pb-24">
      {/* Add Item Form */}
      <div className="bg-white rounded-2xl border border-border shadow-panel overflow-hidden">
        <div className="p-5 bg-gradient-to-r from-amber-600 to-orange-700 text-white flex items-center gap-2">
          <Archive size={20} />
          <h3 className="font-bold text-lg">إدارة المخزون (بكس، كراتين، مواد)</h3>
        </div>
        
        <form onSubmit={handleAdd} className="p-6 grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
          <div className="md:col-span-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">اسم المادة</label>
            <input 
              value={newItem.name}
              onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
              className="w-full px-4 py-3 rounded-xl border border-border bg-gray-50 outline-none"
              placeholder="مثلاً: بكس بلاستيك"
            />
          </div>
          <div className="md:col-span-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">الكمية المتوفرة</label>
            <input 
              type="number"
              value={newItem.quantity}
              onChange={(e) => setNewItem({ ...newItem, quantity: e.target.value })}
              className="w-full px-4 py-3 rounded-xl border border-border bg-gray-50 outline-none"
              placeholder="0"
            />
          </div>
          <div className="md:col-span-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">التنبيه عند (أقل من)</label>
            <input 
              type="number"
              value={newItem.minQuantity}
              onChange={(e) => setNewItem({ ...newItem, minQuantity: e.target.value })}
              className="w-full px-4 py-3 rounded-xl border border-border bg-gray-50 outline-none"
            />
          </div>
          <button 
            type="submit"
            className="w-full h-12 bg-orange-600 text-white rounded-xl font-bold shadow-lg"
          >
            إضافة
          </button>
        </form>
      </div>

      {/* Grid of Items */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {items.map((item: any) => {
          const isLow = item.quantity <= item.minQuantity;
          return (
            <div key={item.id} className={`p-6 rounded-2xl border transition-all ${isLow ? 'bg-red-50 border-red-200' : 'bg-white border-border shadow-sm'}`}>
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                  <div className={`p-3 rounded-xl ${isLow ? 'bg-red-200 text-red-700' : 'bg-orange-100 text-orange-600'}`}>
                    <Package size={24} />
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900">{item.name}</h4>
                    <p className="text-xs text-gray-500">وحدة القياس: {item.unit}</p>
                  </div>
                </div>
                <button onClick={() => handleDelete(item.id)} className="text-gray-300 hover:text-red-500">
                  <Trash2 size={18} />
                </button>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="p-2 bg-white border border-border rounded-lg text-gray-600 hover:bg-gray-50 shadow-sm"><Minus size={18}/></button>
                  <span className={`text-4xl font-black ${isLow ? 'text-red-600' : 'text-gray-800'}`}>{item.quantity}</span>
                  <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="p-2 bg-orange-600 border border-orange-700 rounded-lg text-white hover:bg-orange-700 shadow-sm"><Plus size={18}/></button>
                </div>
                {isLow && (
                  <div className="flex items-center gap-1 text-red-600 font-bold text-xs animate-pulse">
                    <AlertTriangle size={14} /> مخزون منخفض!
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
      
      {items.length === 0 && (
        <div className="p-20 text-center flex flex-col items-center gap-4 text-gray-400">
          <Archive size={48} className="opacity-20" />
          <p className="font-medium">لم يتم إضافة مواد للمخزن بعد</p>
        </div>
      )}
    </div>
  );
}
