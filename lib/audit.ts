import { Prisma } from "@prisma/client";

import { prisma } from "@/lib/prisma";

type AuditParams = {
  actorId?: string | null;

  action: string;

  entityType: string;
  entityId: string;

  description?: string;

  before?: unknown;
  after?: unknown;

  request?: Request;
};

function toAuditJson(
  value: unknown
):
  | Prisma.InputJsonValue
  | Prisma.NullableJsonNullValueInput
  | undefined {
  if (value === undefined) {
    return undefined;
  }

  if (value === null) {
    return Prisma.JsonNull;
  }

  return JSON.parse(
    JSON.stringify(value)
  ) as Prisma.InputJsonValue;
}

export async function logAudit({
  actorId,
  action,

  entityType,
  entityId,

  description,

  before,
  after,

  request,
}: AuditParams) {
  let ipAddress: string | null = null;
  let userAgent: string | null = null;

  if (request) {
    ipAddress =
      request.headers.get("x-forwarded-for") ??
      request.headers.get("x-real-ip") ??
      null;

    userAgent =
      request.headers.get("user-agent") ??
      null;
  }

  await prisma.auditLog.create({
    data: {
      actorId,

      action,

      entityType,
      entityId,

      description,

      before: toAuditJson(before),

      after: toAuditJson(after),

      ipAddress,
      userAgent,
    },
  });
}
