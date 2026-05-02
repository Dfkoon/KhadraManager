import BrandPanel from "./components/BrandPanel";
import SignInForm from "./components/SignInForm";

export default function SignInScreen() {
  return (
    <div className="min-h-screen flex bg-background">
      <div className="hidden md:flex w-1/2">
        <BrandPanel />
      </div>
      <div className="w-full md:w-1/2 flex items-center justify-center p-6 sm:p-12">
        <div className="w-full max-w-md animate-slide-up">
          <div className="mb-8 text-center md:text-right">
            <h1 className="text-3xl font-bold text-foreground mb-2">مرحباً بك مجدداً</h1>
            <p className="text-gray-500">سجل الدخول للمتابعة إلى لوحة التحكم</p>
          </div>
          <SignInForm />
        </div>
      </div>
    </div>
  );
}
