import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const days = parseInt(searchParams.get("days") || "7");
    
    // Calculate date range
    const today = new Date();
    const startDate = new Date();
    startDate.setDate(today.getDate() - days);
    const startDateStr = startDate.toISOString().split('T')[0];

    const entries = await prisma.dailyEntry.findMany({
      where: {
        date: { gte: startDateStr },
        status: "APPROVED"
      }
    });

    const expenses = await prisma.expense.findMany({
      where: { date: { gte: startDateStr } }
    });

    // Group by date
    const dailyStats: Record<string, { date: string, boxes: number, wages: number, expenses: number, profit: number }> = {};
    
    for (let i = 0; i <= days; i++) {
      const d = new Date();
      d.setDate(today.getDate() - i);
      const dStr = d.toLocaleDateString('en-CA');
      dailyStats[dStr] = { date: dStr, boxes: 0, wages: 0, expenses: 0, profit: 0 };
    }

    entries.forEach(e => {
      if (dailyStats[e.date]) {
        dailyStats[e.date].boxes += e.boxes || 0;
        dailyStats[e.date].wages += e.amount || 0;
      }
    });

    expenses.forEach(ex => {
      if (dailyStats[ex.date]) {
        dailyStats[ex.date].expenses += ex.amount || 0;
      }
    });

    const result = Object.values(dailyStats).map(day => ({
      ...day,
      profit: day.wages - day.expenses // This is a simplification; adjust logic as needed
    })).sort((a, b) => a.date.localeCompare(b.date));

    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch report data" }, { status: 500 });
  }
}
