import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const items = await prisma.inventoryItem.findMany();
    return NextResponse.json(items);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch inventory" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { name, quantity, minQuantity, unit } = await req.json();
    const item = await prisma.inventoryItem.create({
      data: { name, quantity: Number(quantity), minQuantity: Number(minQuantity), unit }
    });
    return NextResponse.json(item);
  } catch (error) {
    return NextResponse.json({ error: "Failed to create item" }, { status: 500 });
  }
}
