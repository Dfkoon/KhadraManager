import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const date = searchParams.get('date') || new Date().toLocaleDateString('en-CA');

    const attendance = await prisma.attendance.findMany({
      where: { date }
    });

    return NextResponse.json(attendance);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch attendance" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { workerId, date, status } = await req.json();

    const attendance = await prisma.attendance.upsert({
      where: {
        workerId_date: { workerId, date }
      },
      update: { status },
      create: { workerId, date, status }
    });

    return NextResponse.json(attendance);
  } catch (error) {
    return NextResponse.json({ error: "Failed to update attendance" }, { status: 500 });
  }
}
