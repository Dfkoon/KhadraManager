"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Loader2, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { signIn } from "next-auth/react";

export default function SignInForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  
  const { register, handleSubmit, formState: { errors }, setValue } = useForm();

  const onSubmit = async (data: any) => {
    setIsLoading(true);
    
    const result = await signIn("credentials", {
      username: data.username,
      password: data.password,
      redirect: false,
    });

    if (result?.error) {
      toast.error("بيانات الدخول غير صحيحة. يرجى التأكد من اسم المستخدم وكلمة المرور.");
      setIsLoading(false);
    } else {
      toast.success("تم تسجيل الدخول بنجاح");
      // Check role or just redirect to a middleman? 
      // For now, let's just go to supervisor dashboard, it will redirect admin if needed.
      // But actually, we can check session or just go to root.
      router.push("/supervisor-dashboard");
    }
  };

  const demoAccounts = [
    { role: 'المدير الرئيسي', username: 'admin', password: 'khadra2026' },
    { role: 'المسؤولة — ميسون أم آدم', username: 'maysoun.head', password: 'maysoun2026' },
    { role: 'مدخل أعداد — عبد الوالي', username: 'abd.clerk', password: 'clerk2026' },
    { role: 'مدخل أعداد — محمد حسين', username: 'mohammad.clerk', password: 'clerk2026' },
  ];

  const fillDemoAccount = (acc: any) => {
    setValue('username', acc.username);
    setValue('password', acc.password);
    toast.info(`تم تعبئة بيانات ${acc.role}`);
  };

  return (
    <div className="w-full">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">اسم المستخدم</label>
          <input
            {...register("username", { required: "اسم المستخدم مطلوب" })}
            type="text"
            className={`w-full px-4 py-3 rounded-xl border text-sm transition-all duration-200 outline-none bg-card shadow-card hover:border-primary/40 focus:ring-ring focus:border-ring ${errors.username ? 'border-red-500' : 'border-border'}`}
            placeholder="أدخل اسم المستخدم"
            dir="ltr"
          />
          {errors.username && <p className="text-red-500 text-xs mt-1">{errors.username.message as string}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground mb-2">كلمة المرور</label>
          <div className="relative">
            <input
              {...register("password", { required: "كلمة المرور مطلوبة" })}
              type={showPassword ? "text" : "password"}
              className={`w-full px-4 py-3 rounded-xl border text-sm transition-all duration-200 outline-none bg-card shadow-card hover:border-primary/40 focus:ring-ring focus:border-ring ${errors.password ? 'border-red-500' : 'border-border'}`}
              placeholder="أدخل كلمة المرور"
              dir="ltr"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
          {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message as string}</p>}
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-gradient-primary text-white font-semibold py-3 px-4 rounded-xl hover:opacity-90 active:scale-[0.98] shadow-panel flex items-center justify-center transition-all disabled:opacity-70"
        >
          {isLoading ? <Loader2 className="animate-spin w-5 h-5" /> : "دخول إلى لوحة التحكم"}
        </button>
      </form>

      <div className="mt-10 border-t border-border pt-6">
        <h3 className="text-sm font-semibold text-gray-600 mb-4 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-primary" />
          حسابات تجريبية
        </h3>
        <div className="space-y-3">
          {demoAccounts.map((acc, idx) => (
            <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 border border-border rounded-xl hover:bg-gray-100 transition-colors">
              <div className="flex flex-col">
                <span className="text-xs font-semibold text-foreground">{acc.role}</span>
                <span className="text-[10px] text-gray-500 font-mono" dir="ltr">{acc.username}</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => fillDemoAccount(acc)}
                  className="text-xs px-3 py-1.5 bg-white border border-border rounded-lg hover:border-primary hover:text-primary transition-colors shadow-sm"
                >
                  استخدام
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
