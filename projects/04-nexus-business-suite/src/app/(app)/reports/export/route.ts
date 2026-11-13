import { NextResponse } from "next/server";
import {
  getReportData,
  isReportKey,
  parseReportRange,
  reportCsv,
} from "@/lib/reports";
import { can, type Actor } from "@/lib/permissions";
import { getCurrentUser } from "@/lib/session";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return new NextResponse("Authentication required", { status: 401 });
  }

  const actor: Actor = {
    id: user.id,
    role: user.role,
    departmentId: user.departmentId,
  };
  if (!can(actor, "report.view")) {
    return new NextResponse("Forbidden", { status: 403 });
  }

  const url = new URL(request.url);
  const type = url.searchParams.get("type");
  if (!isReportKey(type)) {
    return new NextResponse("Unknown report", { status: 400 });
  }

  const { range } = parseReportRange(
    url.searchParams.get("from") ?? undefined,
    url.searchParams.get("to") ?? undefined,
  );
  const data = await getReportData(actor, range);
  const filename = `nexus-${type}-${range.from}-to-${range.to}.csv`;

  return new NextResponse(reportCsv(type, data), {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Cache-Control": "no-store",
    },
  });
}
