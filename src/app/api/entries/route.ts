import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status'); // PENDING or APPROVED
    const date = searchParams.get('date');

    const entries = await prisma.dailyEntry.findMany({
      where: {
        ...(status ? { status } : {}),
        ...(date ? { date } : {}),
      },
      include: {
        worker: true,
        product: true,
        supervisor: true
      },
      orderBy: { createdAt: 'desc' }
    });
    
    const formatted = entries.map(e => ({
      id: e.id,
      workerId: e.workerId,
      workerName: e.worker.name,
      productId: e.productId,
      productName: e.product?.name || "ساعات عمل",
      supervisorId: e.supervisorId,
      supervisorName: e.supervisor.name,
      boxes: e.boxes,
      amount: e.amount,
      date: e.date,
      time: e.time,
      status: e.status,
      startTime: e.startTime,
      endTime: e.endTime,
      breakMinutes: e.breakMinutes
    }));

    return NextResponse.json(formatted);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch entries" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const data = await req.json();
    
    // Logic: If PENDING and same worker/product/date, increment instead of create
    if (data.status === "PENDING" && data.productId) {
      const existing = await prisma.dailyEntry.findFirst({
        where: {
          workerId: data.workerId,
          productId: data.productId,
          date: data.date,
          status: "PENDING"
        }
      });

      if (existing) {
        const updated = await prisma.dailyEntry.update({
          where: { id: existing.id },
          data: {
            boxes: existing.boxes + Number(data.boxes),
            amount: existing.amount + Number(data.amount)
          },
          include: { worker: true, product: true, supervisor: true }
        });
        return NextResponse.json(updated);
      }
    }

    const entry = await prisma.dailyEntry.create({
      data: {
        boxes: Number(data.boxes || 0),
        amount: Number(data.amount || 0),
        date: data.date,
        time: data.time,
        status: data.status || "PENDING",
        workerId: data.workerId,
        productId: data.productId,
        supervisorId: data.supervisorId,
        startTime: data.startTime,
        endTime: data.endTime,
        breakMinutes: Number(data.breakMinutes || 0)
      },
      include: {
        worker: true,
        product: true,
        supervisor: true
      }
    });

    return NextResponse.json(entry);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to create entry" }, { status: 500 });
  }
}
