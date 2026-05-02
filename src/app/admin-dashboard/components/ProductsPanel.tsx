"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { Plus, Edit2, Trash2, Check, X, PackageOpen } from "lucide-react";
import { toast } from "sonner";

export default function ProductsPanel({ products, setProducts }: any) {
  const { register, handleSubmit, reset } = useForm();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editPrice, setEditPrice] = useState<number>(0);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const onSubmit = async (data: any) => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: data.name, price: Number(data.price) })
      });
      
      if (res.ok) {
        const newProduct = await res.json();
        setProducts([...products, newProduct]);
        toast.success("تم إضافة المنتج بنجاح");
        reset();
      }
    } catch (error) {
      toast.error("فشل في إضافة المنتج");
    } finally {
      setIsLoading(false);
    }
  };

  const startEdit = (product: any) => {
    setEditingId(product.id);
    setEditPrice(product.price);
  };

  const saveEdit = async (id: string) => {
    try {
      const res = await fetch(`/api/products/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ price: editPrice })
      });
      if (res.ok) {
        setProducts(products.map((p: any) => p.id === id ? { ...p, price: editPrice } : p));
        setEditingId(null);
        toast.success("تم تحديث السعر بنجاح");
      }
    } catch (error) {
      toast.error("فشل في تحديث السعر");
    }
  };

  const confirmDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/products/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setProducts(products.filter((p: any) => p.id !== id));
        setDeletingId(null);
        toast.success("تم حذف المنتج");
      }
    } catch (error) {
      toast.error("فشل في حذف المنتج");
    }
  };

  const getProductColor = (name: string) => {
    if (name.includes('بندورة')) return 'bg-red-50 text-red-600 border-red-200';
    if (name.includes('خيار')) return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    if (name.includes('فلفل')) return 'bg-orange-50 text-orange-600 border-orange-200';
    return 'bg-blue-50 text-blue-600 border-blue-200';
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-4xl mx-auto">
      <div className="bg-white rounded-2xl border border-border shadow-panel overflow-hidden">
        <div className="p-5 bg-gradient-to-r from-blue-600 to-indigo-700 text-white flex items-center gap-2">
          <PackageOpen size={20} />
          <h3 className="font-bold text-lg">إدارة أصناف الخضراوات</h3>
        </div>
        
        <form onSubmit={handleSubmit(onSubmit)} className="p-6 grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">اسم المنتج</label>
            <input 
              {...register("name", { required: true })}
              className="w-full px-4 py-2.5 rounded-xl border border-border bg-gray-50 focus:bg-white outline-none"
              placeholder="مثال: باذنجان"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">السعر (قرش/بكسة)</label>
            <input 
              {...register("price", { required: true, min: 1 })}
              type="number"
              className="w-full px-4 py-2.5 rounded-xl border border-border bg-gray-50 focus:bg-white outline-none"
              placeholder="10"
              dir="ltr"
            />
          </div>
          <button 
            type="submit"
            disabled={isLoading}
            className="h-[46px] bg-gradient-primary text-white rounded-xl font-bold hover:opacity-90 transition-opacity flex items-center justify-center gap-2 shadow-elevated"
          >
            {isLoading ? "جاري الإضافة..." : "إضافة صنف جديد"}
          </button>
        </form>
      </div>

      <div className="bg-card rounded-2xl border border-border shadow-panel overflow-hidden">
        <div className="p-5 border-b border-border bg-gray-50/50 flex justify-between items-center">
          <h3 className="font-bold text-lg">قائمة المنتجات وتسعيرتها ({products.length})</h3>
        </div>
        
        <div className="divide-y divide-border">
          {products.map((product: any) => (
            <div key={product.id} className="p-4 flex items-center justify-between hover:bg-gray-50/50 transition-colors">
              <div className="flex items-center gap-4">
                <div className={`px-4 py-2 rounded-xl border font-bold ${getProductColor(product.name)}`}>
                  {product.name}
                </div>
              </div>

              <div className="flex items-center gap-6">
                {editingId === product.id ? (
                  <div className="flex items-center gap-2">
                    <input 
                      type="number" 
                      value={editPrice}
                      onChange={(e) => setEditPrice(Number(e.target.value))}
                      className="w-20 px-2 py-1.5 border border-border rounded-lg text-center"
                      dir="ltr"
                    />
                    <span className="text-gray-500 text-sm">قرش</span>
                    <button onClick={() => saveEdit(product.id)} className="p-1.5 bg-green-100 text-green-600 rounded hover:bg-green-200"><Check size={16} /></button>
                    <button onClick={() => setEditingId(null)} className="p-1.5 bg-gray-100 text-gray-600 rounded hover:bg-gray-200"><X size={16} /></button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-lg font-bold">
                    <span>{product.price}</span>
                    <span className="text-sm text-gray-500 font-normal">قرش / بكسة</span>
                  </div>
                )}

                <div className="w-px h-8 bg-border hidden md:block"></div>

                <div className="flex items-center gap-1">
                  {deletingId === product.id ? (
                    <div className="flex gap-2 animate-fade-in">
                      <button onClick={() => confirmDelete(product.id)} className="text-xs bg-red-500 text-white px-3 py-1.5 rounded-lg hover:bg-red-600">تأكيد</button>
                      <button onClick={() => setDeletingId(null)} className="text-xs bg-gray-200 text-gray-700 px-3 py-1.5 rounded-lg hover:bg-gray-300">إلغاء</button>
                    </div>
                  ) : (
                    <>
                      <button 
                        onClick={() => startEdit(product)}
                        disabled={editingId !== null}
                        className="p-2 text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-colors disabled:opacity-50"
                      >
                        <Edit2 size={18} />
                      </button>
                      <button 
                        onClick={() => setDeletingId(product.id)}
                        disabled={editingId !== null}
                        className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                      >
                        <Trash2 size={18} />
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
