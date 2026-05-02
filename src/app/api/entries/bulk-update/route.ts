import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const { ids, endTime } = await req.json();
    
    // We need to fetch the entries to get startTime and hourlyRate to calculate new amount
    const entries = await prisma.dailyEntry.findMany({
      where: { id: { in: ids } },
      include: { worker: true }
    });

    const updates = entries.map(entry => {
      const startTime = entry.startTime;
      const rate = entry.worker.hourlyRate || 0;
      
      if (!startTime) return null;

      // Calculate duration
      const [startH, startM] = startTime.split(':').map(Number);
      const [endH, endM] = endTime.split(':').map(Number);
      
      let durationHours = (endH - startH) + (endM - startM) / 60;
      durationHours -= (entry.breakMinutes || 0) / 60;
      
      if (durationHours < 0) durationHours = 0;
      const amount = Number((durationHours * rate).toFixed(2));

      return prisma.dailyEntry.update({
        where: { id: entry.id },
        data: { endTime, amount }
      });
    }).filter(Boolean);

    await Promise.all(updates);
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to bulk update" }, { status: 500 });
  }
}
