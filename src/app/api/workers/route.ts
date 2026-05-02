import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const workers = await prisma.worker.findMany();
    return NextResponse.json(workers);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch workers" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { name, workerType, hourlyRate } = await req.json();
    const worker = await prisma.worker.create({
      data: { 
        name,
        workerType: workerType || "PIECE",
        hourlyRate: workerType === "HOURLY" ? Number(hourlyRate) : null
      }
    });
    return NextResponse.json(worker);
  } catch (error) {
    return NextResponse.json({ error: "Failed to create worker" }, { status: 500 });
  }
}
