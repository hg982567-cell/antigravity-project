import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const [lockdown, flags, settings, plans] = await Promise.all([
      prisma.emergencyLockdown.findFirst({ where: { isActive: true } }),
      prisma.featureFlag.findMany(),
      prisma.systemSetting.findMany(),
      prisma.subscriptionPlan.findMany({
        where: { isActive: true },
        orderBy: { priceMonthly: "asc" },
      }),
    ]);

    const featureFlagsMap: Record<string, boolean> = {};
    flags.forEach((f) => {
      featureFlagsMap[f.key] = f.isEnabled;
    });

    const settingsMap: Record<string, string> = {};
    settings.forEach((s) => {
      settingsMap[s.key] = s.value;
    });

    const maintenanceMode = settingsMap["maintenance_mode"] === "true";
    const platformName = settingsMap["platform_name"] || "RAVAN SHIPPING";

    return NextResponse.json({
      lockdownActive: !!lockdown,
      lockdownReason: lockdown?.reason || null,
      maintenanceMode,
      platformName,
      featureFlags: featureFlagsMap,
      settings: settingsMap,
      plans,
    });
  } catch {
    return NextResponse.json({
      lockdownActive: false,
      maintenanceMode: false,
      featureFlags: {},
      settings: {},
    }, { status: 200 });
  }
}
