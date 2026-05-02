import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  try {
    const { quantity } = await req.json();
    const item = await prisma.inventoryItem.update({
      where: { id: params.id },
      data: { quantity: Number(quantity) }
    });
    return NextResponse.json(item);
  } catch (error) {
    return NextResponse.json({ error: "Failed to update inventory" }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    await prisma.inventoryItem.delete({ where: { id: params.id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete item" }, { status: 500 });
  }
}
