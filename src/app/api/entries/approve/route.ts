import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(req: Request) {
  try {
    const { entryIds } = await req.json();
    
    await prisma.dailyEntry.updateMany({
      where: {
        id: { in: entryIds }
      },
      data: {
        status: "APPROVED"
      }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Failed to approve entries" }, { status: 500 });
  }
}
