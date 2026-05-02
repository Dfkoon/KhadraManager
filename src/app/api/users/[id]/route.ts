import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();
    
    const updated = await prisma.user.update({
      where: { id },
      data: {
        ...(body.name && { name: body.name }),
        ...(body.role && { role: body.role }),
        isActive: body.isActive === true || body.isActive === 1
      }
    });
    
    const { password, ...safe } = updated as any;
    return NextResponse.json(safe);
  } catch (error) {
    return NextResponse.json({ error: "Failed to update user" }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await prisma.user.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete user" }, { status: 500 });
  }
}
