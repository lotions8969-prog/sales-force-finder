import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";
import { FACTOR_DEFINITIONS } from "@/data/factor-definitions";
import { ROLE_DEFINITIONS } from "@/data/role-definitions";
import type { FactorKey, RoleKey } from "@/types";

export async function GET(req: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = (session.user as { id?: string }).id!;
  const userRole = (session.user as { role?: string }).role;
  const { searchParams } = new URL(req.url);
  const sessionId = searchParams.get("sessionId");

  // 管理者は全件、メンバーは自分の分のみ
  const whereClause = sessionId
    ? {
        id: sessionId,
        ...(userRole !== "admin" ? { userId } : {}),
        status: "completed",
      }
    : {
        status: "completed",
        ...(userRole !== "admin" ? { userId } : {}),
      };

  const sessions = await prisma.assessmentSession.findMany({
    where: whereClause,
    include: {
      user: true,
      scoreProfiles: true,
      roleFitResults: { orderBy: { rank: "asc" } },
    },
    orderBy: { completedAt: "desc" },
  });

  if (sessions.length === 0) {
    return NextResponse.json({ error: "No data found" }, { status: 404 });
  }

  // CSV生成
  const factorKeys = Object.keys(FACTOR_DEFINITIONS) as FactorKey[];
  const headers = [
    "氏名",
    "メールアドレス",
    "診断完了日",
    ...factorKeys.map((fk) => FACTOR_DEFINITIONS[fk].labelJa),
    "上位役割1",
    "上位役割2",
    "上位役割3",
  ];

  const rows = sessions.map((s) => {
    const scoreMap: Record<string, number> = {};
    for (const sp of s.scoreProfiles) {
      scoreMap[sp.factorKey] = sp.standardizedScore;
    }
    const topRoles = s.roleFitResults
      .slice(0, 3)
      .map((rf) => ROLE_DEFINITIONS[rf.roleKey as RoleKey]?.labelJa ?? rf.roleKey);

    return [
      s.user.name,
      s.user.email,
      s.completedAt ? new Date(s.completedAt).toLocaleDateString("ja-JP") : "",
      ...factorKeys.map((fk) => scoreMap[fk] ?? ""),
      topRoles[0] ?? "",
      topRoles[1] ?? "",
      topRoles[2] ?? "",
    ].map((v) => `"${String(v).replace(/"/g, '""')}"`);
  });

  const csvContent = [
    headers.map((h) => `"${h}"`).join(","),
    ...rows.map((row) => row.join(",")),
  ].join("\n");

  // BOM付きでUTF-8エンコード（Excelで文字化けしないように）
  const bom = "\uFEFF";
  const blob = bom + csvContent;

  return new NextResponse(blob, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="sales-assessment-${new Date().toISOString().slice(0, 10)}.csv"`,
    },
  });
}
