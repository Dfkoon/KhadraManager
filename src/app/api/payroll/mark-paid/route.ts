import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const { workerId, startDate, endDate } = await req.json();
    
    await prisma.dailyEntry.updateMany({
      where: {
        workerId,
        date: { gte: startDate, lte: endDate },
        status: 'APPROVED',
        isPaid: false
      },
      data: { isPaid: true }
    });
    
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Failed to mark as paid" }, { status: 500 });
  }
}
