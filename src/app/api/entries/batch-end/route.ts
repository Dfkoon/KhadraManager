import { NextResponse } from "next/server"; // Final build fix
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions as any) as any;
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { endTime, breakMinutes, workerIds } = await req.json();
    const date = new Date().toISOString().split('T')[0];

    // 1. Find all PENDING hourly entries for today that don't have an endTime yet
    const entriesToUpdate = await prisma.dailyEntry.findMany({
      where: {
        date,
        endTime: null,
        worker: { workerType: 'HOURLY' },
        ...(workerIds && workerIds.length > 0 ? { workerId: { in: workerIds } } : {})
      },
      include: { worker: true }
    });

    const updates = entriesToUpdate.map(async (entry) => {
      // Calculate duration and amount
      const start = entry.startTime!;
      const end = endTime;
      
      const startMins = parseInt(start.split(':')[0]) * 60 + parseInt(start.split(':')[1]);
      const endMins = parseInt(end.split(':')[0]) * 60 + parseInt(end.split(':')[1]);
      
      const totalMinutes = endMins - startMins - (breakMinutes || 0);
      const hours = totalMinutes / 60;
      const rate = entry.worker.hourlyRate || 0;
      const amount = Math.max(0, hours * rate);

      return prisma.dailyEntry.update({
        where: { id: entry.id },
        data: {
          endTime: end,
          breakMinutes: Number(breakMinutes),
          amount: amount, // Preserving decimals for Dinars
          status: 'APPROVED'
        }
      });
    });

    await Promise.all(updates);

    return NextResponse.json({ success: true, count: entriesToUpdate.length });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to batch end shifts" }, { status: 500 });
  }
}
