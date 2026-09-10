import { prisma } from "@/lib/prisma";

export interface LogOwnerActionParams {
  ownerId: string;
  action: string;
  targetType: "USER" | "AI" | "SUBSCRIPTION" | "SHIPPING" | "PROFIT" | "SYSTEM" | "API" | "SECURITY" | "AUTH";
  targetId?: string;
  previousValue?: unknown;
  newValue?: unknown;
  result?: "SUCCESS" | "REJECTED" | "FAILED";
  severity?: "INFO" | "WARNING" | "HIGH" | "CRITICAL";
  ipAddress?: string;
  userAgent?: string;
}

/**
 * Records an immutable audit log entry for sensitive Owner operations.
 */
export async function logOwnerAction(params: LogOwnerActionParams) {
  try {
    const prevString = params.previousValue
      ? typeof params.previousValue === "string"
        ? params.previousValue
        : JSON.stringify(params.previousValue)
      : null;

    const newString = params.newValue
      ? typeof params.newValue === "string"
        ? params.newValue
        : JSON.stringify(params.newValue)
      : null;

    const log = await prisma.ownerAuditLog.create({
      data: {
        ownerId: params.ownerId,
        action: params.action,
        targetType: params.targetType,
        targetId: params.targetId || null,
        previousValue: prevString,
        newValue: newString,
        result: params.result || "SUCCESS",
        severity: params.severity || "INFO",
        ipAddress: params.ipAddress || null,
        userAgent: params.userAgent || null,
      },
    });

    return log;
  } catch (error) {
    console.error("Failed to write Owner Audit Log:", error);
    return null;
  }
}
