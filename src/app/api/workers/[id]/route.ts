import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const { name, workerType, hourlyRate } = await req.json();
    
    const updated = await prisma.worker.update({
      where: { id },
      data: {
        name,
        workerType,
        hourlyRate: workerType === "HOURLY" ? Number(hourlyRate) : null
      }
    });
    
    return NextResponse.json(updated);
  } catch (error) {
    return NextResponse.json({ error: "Failed to update worker" }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await prisma.worker.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete worker" }, { status: 500 });
  }
}
