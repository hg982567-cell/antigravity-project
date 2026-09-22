import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth/session";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const filter = searchParams.get("filter") || "ALL";

    // Fetch verified global suppliers + custom suppliers created by this user
    const suppliers = await prisma.supplier.findMany({
      where:
        filter === "CUSTOM"
          ? { isCustom: true, userId: user.id }
          : filter === "VERIFIED"
          ? { isCustom: false }
          : {
              OR: [
                { isCustom: false },
                { userId: user.id },
                { userId: null },
              ],
            },
      include: {
        supplierProducts: {
          include: { product: true },
        },
      },
      orderBy: [{ isCustom: "desc" }, { rating: "desc" }],
    });

    return NextResponse.json({ suppliers, count: suppliers.length });
  } catch (err: any) {
    console.error("Suppliers fetch error:", err);
    return NextResponse.json({ error: err.message || "Failed to fetch suppliers" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized: Please log in." }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    const {
      name,
      platform = "CUSTOM",
      country = "US",
      contactEmail,
      websiteUrl,
      fulfillmentSpeedDays = 5,
      rating = 4.9,
      reliabilityScore = 98.0,
      returnPolicy = "30-day buyer protection & full refund",
      notes,
    } = body;

    if (!name || String(name).trim().length === 0) {
      return NextResponse.json({ error: "Supplier name is required." }, { status: 400 });
    }

    const newSupplier = await prisma.supplier.create({
      data: {
        userId: user.id,
        name: String(name).trim(),
        platform: String(platform).toUpperCase(),
        country: String(country).toUpperCase(),
        contactEmail: contactEmail ? String(contactEmail).trim() : null,
        websiteUrl: websiteUrl ? String(websiteUrl).trim() : null,
        fulfillmentSpeedDays: Number(fulfillmentSpeedDays) || 5,
        rating: Number(rating) || 4.9,
        reliabilityScore: Number(reliabilityScore) || 98.0,
        returnPolicy: String(returnPolicy).trim(),
        notes: notes ? String(notes).trim() : null,
        isCustom: true,
        isVerified: true,
        totalOrdersFulfilled: 0,
      },
    });

    return NextResponse.json({
      success: true,
      supplier: newSupplier,
      message: `Supplier '${newSupplier.name}' has been added successfully to your supply chain network.`,
    });
  } catch (err: any) {
    console.error("Create supplier error:", err);
    return NextResponse.json({ error: err.message || "Failed to create supplier." }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Supplier ID is required" }, { status: 400 });
    }

    const existing = await prisma.supplier.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json({ error: "Supplier not found" }, { status: 404 });
    }

    // Security check: Only creator or OWNER can delete
    if (existing.userId !== user.id && user.role !== "OWNER") {
      return NextResponse.json({ error: "Permission denied: Cannot delete verified platform supplier" }, { status: 403 });
    }

    await prisma.supplier.delete({
      where: { id },
    });

    return NextResponse.json({ success: true, message: "Supplier removed successfully." });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to delete supplier" }, { status: 500 });
  }
}
