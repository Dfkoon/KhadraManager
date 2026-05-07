"use client";

export interface DailyEntry {
  id: string;
  date: string;
  time: string;
  supervisorId: string;
  supervisorName: string;
  workerId: string;
  workerName: string;
  productId: string;
  productName: string;
  boxes: number;
  amount: number;
  status: 'PENDING' | 'APPROVED';
  startTime?: string;
  endTime?: string;
}

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import AdminSidebar from "./components/AdminSidebar";
import AdminHeader from "./components/AdminHeader";
import AdminOverviewPanel from "./components/AdminOverviewPanel";
import SupervisorsPanel from "./components/SupervisorsPanel";
import ProductsPanel from "./components/ProductsPanel";
import ReportsPanel from "./components/ReportsPanel";

export default function AdminDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("overview");
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const [supervisors, setSupervisors] = useState([]);
  const [products, setProducts] = useState([]);
  const [entries, setEntries] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/sign-in-screen");
    } else if (status === "authenticated" && (session?.user as any)?.role !== 'ADMIN') {
      router.push("/supervisor-dashboard");
    }
  }, [status, session, router]);

  const fetchData = async () => {
    try {
      const [uRes, pRes, eRes] = await Promise.all([
        fetch('/api/users'), 
        fetch('/api/products'),
        fetch('/api/entries')
      ]);
      
      const [uData, pData, eData] = await Promise.all([
        uRes.json(), pRes.json(), eRes.json()
      ]);
      
      setSupervisors(uData.filter((u: any) => u.role !== 'ADMIN'));
      setProducts(pData);
      setEntries(eData);
    } catch (error) {
      console.error("Failed to fetch admin data", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (status === "authenticated" && (session?.user as any)?.role === 'ADMIN') {
      fetchData();
    }
  }, [status, session]);

  if (status === "loading" || isLoading) {
    return <div className="min-h-screen flex items-center justify-center bg-background">جاري تحميل لوحة الإدارة...</div>;
  }

  return (
    <div className="min-h-screen bg-background flex" dir="rtl">
      <AdminSidebar activeTab={activeTab} setActiveTab={setActiveTab} isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
      
      <div className="flex-1 flex flex-col min-w-0">
        <AdminHeader user={session?.user as any} />
        
        <main className="flex-1 p-6 xl:p-8 max-w-screen-2xl mx-auto w-full overflow-y-auto">
          {activeTab === "overview" && <AdminOverviewPanel supervisors={supervisors} entries={entries} />}
          {activeTab === "supervisors" && <SupervisorsPanel supervisors={supervisors} setSupervisors={setSupervisors} />}
          {activeTab === "products" && <ProductsPanel products={products} setProducts={setProducts} />}
          {activeTab === "reports" && <ReportsPanel entries={entries} supervisors={supervisors} products={products} />}
        </main>
      </div>
    </div>
  );
}
