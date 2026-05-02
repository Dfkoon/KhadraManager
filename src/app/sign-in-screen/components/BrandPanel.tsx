import { Sprout, Box } from "lucide-react";

export default function BrandPanel() {
  return (
    <div className="w-full h-full bg-brand-panel relative overflow-hidden flex flex-col items-center justify-center p-12 text-white">
      {/* Decorative circles */}
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-white/5 rounded-full blur-3xl"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-black/20 rounded-full blur-3xl"></div>

      <div className="relative z-10 flex flex-col items-center text-center max-w-md animate-fade-in">
        <div className="w-24 h-24 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center mb-8 shadow-elevated border border-white/20">
          <div className="relative">
            <Sprout className="w-12 h-12 text-white absolute -top-4 -right-2" />
            <Box className="w-10 h-10 text-white/80" />
          </div>
        </div>
        
        <h1 className="text-4xl font-bold mb-6 leading-tight">تتبع الحصاد. احسب الأجور. بكل سهولة.</h1>
        <p className="text-white/80 text-lg mb-12">
          نظام الخضراوات المتكامل لإدارة العمال والمنتجات بكفاءة واحترافية.
        </p>

        <div className="grid grid-cols-3 gap-4 w-full">
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/10 text-center shadow-panel">
            <div className="text-2xl font-bold mb-1">48</div>
            <div className="text-xs text-white/70">عامل نشط</div>
          </div>
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/10 text-center shadow-panel">
            <div className="text-2xl font-bold mb-1">1,240</div>
            <div className="text-xs text-white/70">بكسة اليوم</div>
          </div>
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/10 text-center shadow-panel">
            <div className="text-2xl font-bold mb-1">6</div>
            <div className="text-xs text-white/70">مشرفين</div>
          </div>
        </div>

        <div className="mt-16 flex items-center gap-2 text-sm text-white/60 bg-black/20 px-4 py-2 rounded-full">
          <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse-soft"></div>
          النظام يعمل بكفاءة
        </div>
      </div>
    </div>
  );
}
