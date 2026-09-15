import { Router, type IRouter } from "express";
import { eq, sql } from "drizzle-orm";
import {
  db, institutionsTable, applicationsTable, paymentsTable,
  dormitoriesTable, inventoryTable, documentsTable, auditLogsTable,
  studentsTable, usersTable
} from "@workspace/db";
import { requireAuth, type AuthRequest } from "../middlewares/auth";

const router: IRouter = Router();

router.get("/dashboard/super-admin", requireAuth, async (req: AuthRequest, res): Promise<void> => {
  const [{ totalInstitutions }] = await db.select({ totalInstitutions: sql<number>`count(*)` }).from(institutionsTable);
  const [{ pendingInstitutions }] = await db.select({ pendingInstitutions: sql<number>`count(*)` }).from(institutionsTable).where(eq(institutionsTable.status, "pending"));
  const [{ totalApplications }] = await db.select({ totalApplications: sql<number>`count(*)` }).from(applicationsTable);
  const [{ totalStudents }] = await db.select({ totalStudents: sql<number>`count(*)` }).from(studentsTable);
  const [{ activeSubscriptions }] = await db.select({ activeSubscriptions: sql<number>`count(*)` }).from(institutionsTable).where(eq(institutionsTable.subscriptionStatus, "active"));
  const revenueRows = await db.select({ amount: paymentsTable.amount }).from(paymentsTable).where(eq(paymentsTable.status, "confirmed"));
  const totalRevenue = revenueRows.reduce((sum, r) => sum + parseFloat(r.amount), 0);

  const byLevel = await db.select({ level: institutionsTable.level, count: sql<number>`count(*)` }).from(institutionsTable).groupBy(institutionsTable.level);
  const byStatus = await db.select({ status: applicationsTable.status, count: sql<number>`count(*)` }).from(applicationsTable).groupBy(applicationsTable.status);

  res.json({
    totalInstitutions: Number(totalInstitutions),
    pendingInstitutions: Number(pendingInstitutions),
    totalApplications: Number(totalApplications),
    totalRevenue,
    totalStudents: Number(totalStudents),
    activeSubscriptions: Number(activeSubscriptions),
    institutionsByLevel: byLevel.map(r => ({ label: r.level, count: Number(r.count) })),
    applicationsByStatus: byStatus.map(r => ({ label: r.status, count: Number(r.count) })),
  });
});

router.get("/dashboard/institution/:id", requireAuth, async (req: AuthRequest, res): Promise<void> => {
  const id = parseInt(req.params.id as string, 10);
  const [{ totalApplications }] = await db.select({ totalApplications: sql<number>`count(*)` }).from(applicationsTable).where(eq(applicationsTable.institutionId, id));
  const [{ approvedApplications }] = await db.select({ approvedApplications: sql<number>`count(*)` }).from(applicationsTable).where(eq(applicationsTable.institutionId, id));
  const [{ reportingStudents }] = await db.select({ reportingStudents: sql<number>`count(*)` }).from(applicationsTable).where(eq(applicationsTable.status, "checked_in"));
  const [{ pendingDocs }] = await db.select({ pendingDocs: sql<number>`count(*)` }).from(documentsTable).where(eq(documentsTable.status, "pending"));

  const dorms = await db.select().from(dormitoriesTable).where(eq(dormitoriesTable.institutionId, id));
  const totalCap = dorms.reduce((s, d) => s + d.capacity, 0);
  const totalOcc = dorms.reduce((s, d) => s + d.occupancy, 0);
  const dormitoryOccupancy = totalCap > 0 ? Math.round((totalOcc / totalCap) * 100) : 0;

  const invItems = await db.select().from(inventoryTable).where(eq(inventoryTable.institutionId, id));
  const inventoryAlerts = invItems.filter(i => i.quantityAvailable < 10).length;

  const payments = await db.select().from(paymentsTable);
  const confirmedPayments = payments.filter(p => p.status === "confirmed");
  const totalRevenue = confirmedPayments.reduce((s, p) => s + parseFloat(p.amount), 0);

  const today = new Date(); today.setHours(0, 0, 0, 0);
  const apps = await db.select().from(applicationsTable).where(eq(applicationsTable.institutionId, id));
  const checkedInToday = apps.filter(a => a.checkedInAt && a.checkedInAt >= today).length;

  res.json({
    totalApplications: Number(totalApplications),
    approvedApplications: Number(approvedApplications),
    pendingDocuments: Number(pendingDocs),
    reportingStudents: Number(reportingStudents),
    totalRevenue,
    pendingPayments: payments.filter(p => p.status === "pending").length,
    inventoryAlerts,
    dormitoryOccupancy,
    checkedInToday,
  });
});

router.get("/dashboard/recent-activity", requireAuth, async (req: AuthRequest, res): Promise<void> => {
  const limit = parseInt((req.query.limit as string) ?? "20", 10);
  const logs = await db.select().from(auditLogsTable).orderBy(auditLogsTable.createdAt).limit(limit);
  res.json(logs.map(l => ({ id: l.id, type: l.entityType ?? "system", description: l.action, createdAt: l.createdAt })));
});

router.get("/dashboard/application-pipeline", requireAuth, async (req: AuthRequest, res): Promise<void> => {
  const { institutionId } = req.query;
  let apps = await db.select().from(applicationsTable);
  if (institutionId) apps = apps.filter(a => a.institutionId === Number(institutionId));
  const counts: Record<string, number> = {};
  for (const a of apps) { counts[a.status] = (counts[a.status] ?? 0) + 1; }
  const labels: Record<string, string> = { draft: "Draft", pending: "Pending", under_review: "Under Review", approved: "Approved", rejected: "Rejected", checked_in: "Checked In" };
  res.json(Object.entries(counts).map(([status, count]) => ({ status, count, label: labels[status] ?? status })));
});

router.get("/dashboard/revenue-summary", requireAuth, async (req: AuthRequest, res): Promise<void> => {
  const payments = await db.select().from(paymentsTable).where(eq(paymentsTable.status, "confirmed"));
  const byMonth: Record<string, { revenue: number; payments: number }> = {};
  for (const p of payments) {
    const month = p.createdAt.toISOString().slice(0, 7);
    if (!byMonth[month]) byMonth[month] = { revenue: 0, payments: 0 };
    byMonth[month].revenue += parseFloat(p.amount);
    byMonth[month].payments += 1;
  }
  res.json(Object.entries(byMonth).sort().map(([month, v]) => ({ month, revenue: v.revenue, payments: v.payments })));
});

export default router;
