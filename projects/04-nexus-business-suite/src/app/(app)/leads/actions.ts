"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { LEAD_STAGES, LEAD_STAGE_LABELS, isLeadStage } from "@/lib/domain";
import {
  can,
  canAccessDepartment,
  type Actor,
} from "@/lib/permissions";
import { requireUser } from "@/lib/session";

const stageSchema = z.object({
  leadId: z.coerce.number().int().positive(),
  stage: z.enum(LEAD_STAGES),
});

export async function updateLeadStage(formData: FormData): Promise<void> {
  const user = await requireUser("/leads");
  const actor: Actor = {
    id: user.id,
    role: user.role,
    departmentId: user.departmentId,
  };
  if (!can(actor, "lead.stage_change")) return;

  const parsed = stageSchema.safeParse({
    leadId: formData.get("leadId"),
    stage: formData.get("stage"),
  });
  if (!parsed.success || !isLeadStage(parsed.data.stage)) return;

  const lead = await prisma.lead.findUnique({
    where: { id: parsed.data.leadId },
    include: { owner: { select: { departmentId: true } } },
  });
  if (!lead) return;
  if (!canAccessDepartment(actor, lead.owner?.departmentId ?? null)) return;
  if (lead.stage === parsed.data.stage) return;

  const from = isLeadStage(lead.stage) ? LEAD_STAGE_LABELS[lead.stage] : lead.stage;
  const to = LEAD_STAGE_LABELS[parsed.data.stage];

  await prisma.$transaction([
    prisma.lead.update({
      where: { id: lead.id },
      data: { stage: parsed.data.stage },
    }),
    prisma.activityLog.create({
      data: {
        actorId: actor.id,
        action: "lead.stage_changed",
        entityType: "lead",
        entityId: lead.id,
        summary: `${lead.name} moved from ${from} to ${to}`,
        metadata: JSON.stringify({ from: lead.stage, to: parsed.data.stage }),
      },
    }),
  ]);

  revalidatePath("/leads");
  revalidatePath("/pipeline");
  revalidatePath("/dashboard");
}
