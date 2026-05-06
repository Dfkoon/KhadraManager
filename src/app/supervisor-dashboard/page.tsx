"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import SupervisorSidebar from "./components/SupervisorSidebar";
import SupervisorHeader from "./components/SupervisorHeader";
import DailyEntryPanel from "./components/DailyEntryPanel";
import TodaySummaryPanel from "./components/TodaySummaryPanel";
import EntryLogs from "./components/EntryLogs";
import WorkersPanel from "./components/WorkersPanel";
import AttendancePanel from "./components/AttendancePanel";
import ReportsPanel from "./components/ReportsPanel";
import ApprovalsPanel from "./components/ApprovalsPanel";
import ClerksPanel from "./components/ClerksPanel";
import ProductsPanel from "./components/ProductsPanel";
import ExpensesPanel from "./components/ExpensesPanel";
import PayrollPanel from "./components/PayrollPanel";
import ArchivePanel from "./components/ArchivePanel";

export default function SupervisorDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("entry");
  const [isOpen, setIsOpen] = useState(true);
  const [sessionClosed, setSessionClosed] = useState(false);
  
  const [workers, setWorkers] = useState([]);
  const [products, setProducts] = useState([]);
  const [entries, setEntries] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [clerks, setClerks] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/sign-in-screen");
    }
  }, [status, router]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [wRes, pRes, eRes, aRes, uRes, exRes, iRes] = await Promise.all([
          fetch('/api/workers'),
          fetch('/api/products'),
          fetch('/api/entries'),
          fetch('/api/attendance'),
          fetch('/api/users'),
          fetch('/api/expenses'),
          fetch('/api/inventory')
        ]);
        
        const [wData, pData, eData, aData, uData, exData, iData] = await Promise.all([
          wRes.json(), pRes.json(), eRes.json(), aRes.json(), uRes.json(), exRes.json(), iRes.json()
        ]);
        
        setWorkers(wData);
        setProducts(pData);
        setEntries(eData);
        setAttendance(aData);
        setClerks(uData.filter((u: any) => u.role === 'CLERK'));
        setExpenses(exData);
        setInventory(iData);
      } catch (error) {
        console.error("Failed to fetch data", error);
      } finally {
        setIsLoading(false);
      }
    };

    if (status === "authenticated" && ((session?.user as any)?.role === 'ADMIN')) {
      fetchData();
    }
  }, [status, session]);

  if (status === "loading" || isLoading) {
    return <div className="min-h-screen flex items-center justify-center bg-background">جاري التحميل...</div>;
  }

  const userRole = (session?.user as any)?.role;
  const isHead = userRole === 'ADMIN' || userRole === 'HEAD_SUPERVISOR';
  
  const approvedEntries = entries.filter((e: any) => e.status === 'APPROVED');
  
  // Logic: 
  // 1. If HEAD, see everyone (Hourly + Piece).
  // 2. If CLERK, see ALL PIECE workers only.
  const visibleWorkers = isHead 
    ? workers 
    : workers.filter((w: any) => w.workerType === 'PIECE');

  // Filter entries for summary: Clerks should not see hourly worker wages/stats
  const summaryEntries = isHead
    ? approvedEntries
    : approvedEntries.filter((e: any) => !e.startTime);

  const pendingEntries = entries.filter((e: any) => e.status === 'PENDING');

  return (
    <div className="flex min-h-screen bg-background overflow-hidden" dir="rtl">
      <SupervisorSidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        isOpen={isOpen} 
        setIsOpen={setIsOpen} 
        role={userRole}
      />
      
      <main className="flex-1 flex flex-col min-w-0 h-screen">
        <SupervisorHeader 
          sessionClosed={sessionClosed} 
          setSessionClosed={setSessionClosed}
          entries={entries}
          setEntries={setEntries}
          user={session?.user as any}
        />
        
        <div className="flex-1 overflow-y-auto p-4 md:p-8 pb-24 md:pb-8">
          <div className="max-w-6xl mx-auto space-y-8">
            
            {activeTab === "reports" && isHead && (
              <ReportsPanel sessionClosed={sessionClosed} />
            )}

            {activeTab === "entry" && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-1 space-y-6">
                  <DailyEntryPanel 
                    workers={visibleWorkers} 
                    products={products}
                    entries={entries}
                    setEntries={setEntries}
                    sessionClosed={sessionClosed}
                    user={session?.user as any}
                  />
                  {isHead && pendingEntries.length > 0 && (
                    <div className="hidden lg:block">
                      <ApprovalsPanel pendingEntries={pendingEntries} setEntries={setEntries} />
                    </div>
                  )}
                </div>
                <div className="lg:col-span-2 space-y-6">
                  <TodaySummaryPanel 
                    entries={summaryEntries} 
                    setEntries={setEntries} 
                    sessionClosed={sessionClosed} 
                    isHead={isHead}
                    workers={workers}
                    products={products}
                  />
                  {isHead && (
                    <div className="lg:hidden">
                       <ApprovalsPanel pendingEntries={pendingEntries} setEntries={setEntries} />
                    </div>
                  )}
                  <EntryLogs 
                    entries={isHead ? entries : entries.filter((e: any) => e.supervisorId === (session?.user as any)?.id && !e.startTime)} 
                    workers={workers}
                    products={products}
                  />
                </div>
              </div>
            )}

            {activeTab === "workers" && isHead && (
              <WorkersPanel workers={workers} setWorkers={setWorkers} sessionClosed={sessionClosed} />
            )}

            {activeTab === "attendance" && isHead && (
              <AttendancePanel 
                workers={workers} 
                attendance={attendance} 
                setAttendance={setAttendance} 
                entries={entries}
                setEntries={setEntries}
              />
            )}
            
            {activeTab === "approvals" && isHead && (
              <ApprovalsPanel pendingEntries={pendingEntries} setEntries={setEntries} />
            )}

            {activeTab === "clerks" && isHead && (
              <ClerksPanel clerks={clerks} setClerks={setClerks} />
            )}

            {activeTab === "archive" && isHead && (
              <ArchivePanel entries={entries} products={products} />
            )}

            {activeTab === "payroll" && isHead && (
              <PayrollPanel workers={workers} entries={entries} products={products} />
            )}

            {activeTab === "expenses" && isHead && (
              <ExpensesPanel />
            )}
            
            {activeTab === "products" && isHead && (
              <ProductsPanel products={products} setProducts={setProducts} sessionClosed={sessionClosed} />
            )}

          </div>
        </div>
      </main>
    </div>
  );
}
