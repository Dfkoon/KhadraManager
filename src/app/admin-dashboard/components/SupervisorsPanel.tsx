"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { Plus, Search, Trash2, Eye, EyeOff, UserCircle2, UserCog, ShieldCheck } from "lucide-react";
import { toast } from "sonner";

export default function SupervisorsPanel({ supervisors, setSupervisors }: any) {
  const { register, handleSubmit, reset, formState: { errors } } = useForm();
  const [searchTerm, setSearchTerm] = useState("");
  const [showPassword, setShowPassword] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const onSubmit = async (data: any) => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      
      if (res.ok) {
        const newUser = await res.json();
        setSupervisors([...supervisors, newUser]);
        toast.success("تم إضافة الحساب بنجاح");
        reset();
      } else {
        toast.error("فشل في إضافة الحساب. ربما اسم المستخدم موجود مسبقاً.");
      }
    } catch (error) {
      toast.error("حدث خطأ أثناء الإضافة");
    } finally {
      setIsLoading(false);
    }
  };

  const confirmDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/users/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setSupervisors(supervisors.filter((s: any) => s.id !== id));
        setDeletingId(null);
        toast.success("تم الحذف بنجاح");
      }
    } catch (error) {
      toast.error("فشل في الحذف");
    }
  };

  const filteredSupervisors = supervisors.filter((s: any) => 
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    s.username.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="bg-white rounded-2xl border border-border shadow-panel overflow-hidden">
        <div className="p-5 bg-gradient-to-r from-blue-600 to-indigo-700 text-white flex items-center gap-2">
          <UserCog size={20} />
          <h3 className="font-bold text-lg">إدارة حسابات المشرفين والمدخلين</h3>
        </div>
        
        <form onSubmit={handleSubmit(onSubmit)} className="p-6 grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
          <div className="md:col-span-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">الاسم الكامل</label>
            <input 
              {...register("name", { required: true })}
              className="w-full px-4 py-2.5 rounded-xl border border-border bg-gray-50 focus:bg-white outline-none"
              placeholder="مثال: زيد أبو كريم"
            />
          </div>
          <div className="md:col-span-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">اسم المستخدم</label>
            <input 
              {...register("username", { required: true })}
              className="w-full px-4 py-2.5 rounded-xl border border-border bg-gray-50 focus:bg-white outline-none"
              placeholder="zaid.clerk"
              dir="ltr"
            />
          </div>
          <div className="md:col-span-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">كلمة المرور</label>
            <input 
              {...register("password", { required: true, minLength: 4 })}
              className="w-full px-4 py-2.5 rounded-xl border border-border bg-gray-50 focus:bg-white outline-none"
              placeholder="••••"
              dir="ltr"
            />
          </div>
          <div className="md:col-span-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">نوع الصلاحية</label>
            <select
              {...register("role", { required: true })}
              className="w-full px-4 py-2.5 rounded-xl border border-border bg-gray-50 focus:bg-white outline-none"
            >
              <option value="CLERK">مدخل أعداد (فقط)</option>
              <option value="HEAD_SUPERVISOR">مسؤول (ميسون)</option>
            </select>
          </div>
          <button 
            type="submit"
            disabled={isLoading}
            className="h-[46px] bg-gradient-primary text-white rounded-xl font-bold hover:opacity-90 transition-opacity flex items-center justify-center gap-2 shadow-elevated"
          >
            {isLoading ? "جاري الإضافة..." : "إنشاء الحساب"}
          </button>
        </form>
      </div>

      <div className="bg-card rounded-2xl border border-border shadow-panel overflow-hidden">
        <div className="p-4 border-b border-border flex justify-between items-center bg-gray-50/50">
          <h3 className="font-bold text-lg">قائمة المستخدمين ({supervisors.length})</h3>
          <div className="relative w-64">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-4 pr-10 py-2 rounded-xl border border-border bg-white text-sm"
              placeholder="بحث بالاسم أو المعرف..."
            />
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-right text-sm">
            <thead className="bg-gray-50/50 text-gray-500 font-medium border-b border-border">
              <tr>
                <th className="px-6 py-4 text-right">الاسم</th>
                <th className="px-6 py-4 text-right">اسم المستخدم</th>
                <th className="px-6 py-4 text-right">الصلاحية</th>
                <th className="px-6 py-4 text-center">الإجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredSupervisors.map((sup: any) => (
                <tr key={sup.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${sup.role === 'HEAD_SUPERVISOR' ? 'bg-indigo-100 text-indigo-700' : 'bg-amber-100 text-amber-700'}`}>
                        {sup.name.charAt(0)}
                      </div>
                      <span className="font-bold text-gray-800">{sup.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 font-mono text-gray-500" dir="ltr">{sup.username}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full font-bold text-[10px] ${sup.role === 'HEAD_SUPERVISOR' ? 'bg-indigo-50 text-indigo-700 border border-indigo-200' : 'bg-amber-50 text-amber-700 border border-amber-200'}`}>
                      {sup.role === 'HEAD_SUPERVISOR' ? <ShieldCheck size={12}/> : <UserCircle2 size={12}/>}
                      {sup.role === 'HEAD_SUPERVISOR' ? 'مسؤول (ميسون)' : 'مدخل أعداد'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex justify-center items-center">
                      {deletingId === sup.id ? (
                        <div className="flex gap-2 animate-fade-in">
                          <button onClick={() => confirmDelete(sup.id)} className="text-xs bg-red-500 text-white px-3 py-1.5 rounded-lg hover:bg-red-600">تأكيد</button>
                          <button onClick={() => setDeletingId(null)} className="text-xs bg-gray-200 text-gray-700 px-3 py-1.5 rounded-lg hover:bg-gray-300">إلغاء</button>
                        </div>
                      ) : (
                        <button onClick={() => setDeletingId(sup.id)} className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                          <Trash2 size={18} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
