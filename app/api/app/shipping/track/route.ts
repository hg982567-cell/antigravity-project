import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth/session";
import { resolveTrackingData, detectCarrier } from "@/lib/shipping/carrierTracker";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const trackingNumber = searchParams.get("trackingNumber")?.trim();
    const orderNumber = searchParams.get("orderNumber")?.trim();
    const customerEmail = searchParams.get("email")?.trim().toLowerCase();

    // 1. Merchant Authenticated Session (if present)
    const currentUser = await getCurrentUser().catch(() => null);

    // 2. Query Shipment by tracking number or order number
    let shipment: any = null;

    if (trackingNumber) {
      shipment = await prisma.shipment.findFirst({
        where: { trackingNumber: { equals: trackingNumber, mode: "insensitive" } },
        include: {
          order: {
            include: {
              customer: true,
              items: true,
            },
          },
        },
      });
    } else if (orderNumber) {
      const order = await prisma.order.findFirst({
        where: { orderNumber: { equals: orderNumber, mode: "insensitive" } },
        include: {
          customer: true,
          items: true,
          shipments: true,
        },
      });

      if (order && order.shipments && order.shipments.length > 0) {
        shipment = {
          ...order.shipments[0],
          order,
        };
      }
    }

    // 3. Authorization & Tenant Isolation Checks
    if (shipment) {
      const isOwnerOrMerchant = currentUser && (
        currentUser.id === shipment.order.userId ||
        currentUser.role === "OWNER" ||
        currentUser.role === "ADMIN"
      );

      const isAuthorizedCustomer = customerEmail && (
        shipment.order.customer?.email?.toLowerCase() === customerEmail
      );

      // If requested by a logged-in user who does NOT own this shipment, block access
      if (currentUser && !isOwnerOrMerchant) {
        return NextResponse.json(
          { error: "Forbidden: You do not have permission to view this shipment." },
          { status: 403 }
        );
      }

      // If requested anonymously without merchant auth, customer email verification is required for order details
      const allowSensitiveDetails = Boolean(isOwnerOrMerchant || isAuthorizedCustomer);

      const trackingResult = resolveTrackingData({
        trackingNumber: shipment.trackingNumber,
        declaredCarrier: shipment.carrier,
        storedStatus: shipment.status,
        storedEstimatedDelivery: shipment.estimatedDelivery,
        storedEventsJson: shipment.eventsJson,
      });

      return NextResponse.json({
        success: true,
        tracking: trackingResult,
        order: {
          id: shipment.order.id,
          orderNumber: shipment.order.orderNumber,
          status: shipment.order.status,
          fulfillmentStatus: shipment.order.fulfillmentStatus,
          destinationCity: shipment.order.customer?.city || "Destination Hub",
          destinationCountry: shipment.order.customer?.country || "US",
          itemsCount: shipment.order.items?.length || 1,
          items: allowSensitiveDetails ? shipment.order.items : undefined,
        },
      });
    }

    // 4. Fallback if tracking number provided is valid pattern but not in local DB:
    // Identify carrier and provide real carrier tracking portal link, but report status unavailable
    if (trackingNumber) {
      const detected = detectCarrier(trackingNumber);
      const fallbackResult = resolveTrackingData({
        trackingNumber,
        declaredCarrier: detected.name,
      });

      return NextResponse.json({
        success: true,
        tracking: fallbackResult,
        order: null,
      });
    }

    return NextResponse.json(
      { error: "Please provide a valid tracking number or order number." },
      { status: 400 }
    );
  } catch (error) {
    console.error("Shipping track API error:", error);
    return NextResponse.json({ error: "Failed to resolve tracking telemetry." }, { status: 500 });
  }
}
