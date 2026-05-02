"use client";

import { useState } from "react";
import { Plus, Search, Trash2, Package, Edit2, Check, X, Tag } from "lucide-react";
import { toast } from "sonner";

export default function ProductsPanel({ products, setProducts, sessionClosed }: any) {
  const [name, setName] = useState("");
  const [price, setPrice] = useState<number | "">("");
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Edit State
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editPrice, setEditPrice] = useState<number | "">("");

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (sessionClosed || isLoading || !name || !price) return;

    setIsLoading(true);
    try {
      const res = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, price: Number(price) })
      });

      if (res.ok) {
        const saved = await res.json();
        setProducts([...products, saved]);
        setName("");
        setPrice("");
        toast.success("تمت إضافة المنتج بنجاح");
      }
    } catch (error) {
      toast.error("فشل في إضافة المنتج");
    } finally {
      setIsLoading(false);
    }
  };

  const startEdit = (product: any) => {
    setEditingId(product.id);
    setEditName(product.name);
    setEditPrice(product.price);
  };

  const handleUpdate = async (id: string) => {
    try {
      const res = await fetch(`/api/products/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: editName, price: Number(editPrice) })
      });

      if (res.ok) {
        const updated = await res.json();
        setProducts(products.map((p: any) => p.id === id ? updated : p));
        setEditingId(null);
        toast.success("تم تحديث السعر بنجاح");
      }
    } catch (error) {
      toast.error("فشل في التعديل");
    }
  };

  const handleDelete = async (id: string) => {
    if (sessionClosed || !confirm("هل أنت متأكد من حذف هذا المنتج؟")) return;
    
    try {
      const res = await fetch(`/api/products/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setProducts(products.filter((p: any) => p.id !== id));
        toast.success("تم حذف المنتج");
      }
    } catch (error) {
      toast.error("فشل في الحذف");
    }
  };

  const filtered = products.filter((p: any) => p.name.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="space-y-6 animate-fade-in max-w-4xl mx-auto pb-24">
      {/* Add Product Form */}
      <div className="bg-white rounded-2xl border border-border shadow-panel overflow-hidden">
        <div className="p-5 bg-gradient-to-r from-blue-600 to-indigo-700 text-white flex items-center gap-2">
          <Tag size={20} />
          <h3 className="font-bold text-lg">إدارة أسعار المنتجات</h3>
        </div>
        
        <form onSubmit={handleAdd} className="p-6 grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
          <div className="md:col-span-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">اسم الصنف (بندورة، خيار...)</label>
            <input 
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-border bg-gray-50 focus:bg-white outline-none transition-all"
              placeholder="مثلاً: بندورة نخب أول"
            />
          </div>
          <div className="md:col-span-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">سعر البكسة (بالقرش)</label>
            <input 
              type="number"
              value={price}
              onChange={(e) => setPrice(e.target.value === "" ? "" : Number(e.target.value))}
              className="w-full px-4 py-3 rounded-xl border border-border bg-gray-50 focus:bg-white outline-none transition-all"
              placeholder="مثلاً: 50"
            />
          </div>
          <button 
            type="submit"
            disabled={sessionClosed || !name || !price || isLoading}
            className="w-full h-[52px] bg-gradient-primary text-white rounded-xl font-bold flex items-center justify-center gap-2 shadow-elevated disabled:opacity-50"
          >
            {isLoading ? "جاري الحفظ..." : <><Plus size={18} /> إضافة صنف جديد</>}
          </button>
        </form>
      </div>

      {/* List */}
      <div className="bg-white rounded-2xl border border-border shadow-panel overflow-hidden">
        <div className="p-4 border-b border-border bg-gray-50/50 flex justify-between items-center">
          <h3 className="font-bold text-lg flex items-center gap-2">
             <Package size={20} className="text-primary"/>
             قائمة الأصناف الحالية ({products.length})
          </h3>
          <div className="relative w-64">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pr-10 pl-4 py-2 rounded-xl border border-border bg-white text-sm"
              placeholder="بحث عن صنف..."
            />
          </div>
        </div>
        
        <div className="divide-y divide-border">
          {filtered.map((product: any) => (
            <div key={product.id} className="p-4 flex items-center justify-between hover:bg-gray-50/50 transition-colors">
              {editingId === product.id ? (
                <div className="flex-1 grid grid-cols-2 gap-3 items-center animate-in fade-in slide-in-from-left-2">
                  <input value={editName} onChange={(e)=>setEditName(e.target.value)} className="px-3 py-2 border rounded-lg outline-none text-sm" />
                  <div className="flex gap-2">
                    <input type="number" value={editPrice} onChange={(e)=>setEditPrice(Number(e.target.value))} className="w-24 px-3 py-2 border rounded-lg outline-none text-sm" />
                    <button onClick={() => handleUpdate(product.id)} className="p-2 bg-green-600 text-white rounded-lg"><Check size={16}/></button>
                    <button onClick={() => setEditingId(null)} className="p-2 bg-gray-200 text-gray-700 rounded-lg"><X size={16}/></button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                      {product.name.charAt(0)}
                    </div>
                    <div>
                      <p className="font-bold text-gray-900">{product.name}</p>
                      <p className="text-xs text-gray-500">سعر البكسة: <span className="text-orange-600 font-bold">{product.price} قرش</span></p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => startEdit(product)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"><Edit2 size={18}/></button>
                    <button onClick={() => handleDelete(product.id)} disabled={sessionClosed} className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg"><Trash2 size={18}/></button>
                  </div>
                </>
              )}
            </div>
          ))}
          {filtered.length === 0 && (
            <div className="p-12 text-center text-gray-400">لا يوجد أصناف مطابقة</div>
          )}
        </div>
      </div>
    </div>
  );
}
