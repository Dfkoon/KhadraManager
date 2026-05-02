import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const { ids } = await req.json();
    
    await prisma.dailyEntry.deleteMany({
      where: { id: { in: ids } }
    });
    
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Failed to bulk delete" }, { status: 500 });
  }
}
