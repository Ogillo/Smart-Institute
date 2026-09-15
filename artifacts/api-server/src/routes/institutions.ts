import { Router, type IRouter } from "express";
import { eq, ilike, and, sql } from "drizzle-orm";
import { db, institutionsTable, feeStructuresTable, applicationsTable, studentsTable } from "@workspace/db";
import { requireAuth, type AuthRequest } from "../middlewares/auth";

const router: IRouter = Router();

router.get("/institutions", async (req, res): Promise<void> => {
  const { search, county, category, level, status } = req.query as Record<string, string>;
  const conditions: any[] = [];
  if (search) conditions.push(ilike(institutionsTable.name, `%${search}%`));
  if (county) conditions.push(ilike(institutionsTable.county, `%${county}%`));
  if (category) conditions.push(eq(institutionsTable.category, category));
  if (level) conditions.push(eq(institutionsTable.level, level as any));
  if (status) conditions.push(eq(institutionsTable.status, status as any));
  else conditions.push(eq(institutionsTable.status, "approved"));

  const institutions = await db.select().from(institutionsTable).where(conditions.length ? and(...conditions) : undefined).orderBy(institutionsTable.name);

  const result = await Promise.all(institutions.map(async (inst) => {
    const [{ count: appCount }] = await db.select({ count: sql<number>`count(*)` }).from(applicationsTable).where(eq(applicationsTable.institutionId, inst.id));
    return { ...inst, totalApplications: Number(appCount), totalStudents: Number(appCount) };
  }));
  res.json(result);
});

router.post("/institutions", requireAuth, async (req: AuthRequest, res): Promise<void> => {
  const { name, level, category, county, address, phone, email, website, logoUrl, reportingDateFrom, reportingDateTo, admissionRequirements } = req.body;
  if (!name || !level || !county) { res.status(400).json({ error: "name, level, county required" }); return; }
  const [inst] = await db.insert(institutionsTable).values({ name, level, category, county, address, phone, email, website, logoUrl, reportingDateFrom, reportingDateTo, admissionRequirements }).returning();
  res.status(201).json({ ...inst, totalApplications: 0, totalStudents: 0 });
});

router.get("/institutions/:id", async (req, res): Promise<void> => {
  const id = parseInt(req.params.id as string, 10);
  const [inst] = await db.select().from(institutionsTable).where(eq(institutionsTable.id, id));
  if (!inst) { res.status(404).json({ error: "Not found" }); return; }
  const [{ count }] = await db.select({ count: sql<number>`count(*)` }).from(applicationsTable).where(eq(applicationsTable.institutionId, id));
  res.json({ ...inst, totalApplications: Number(count), totalStudents: Number(count) });
});

router.patch("/institutions/:id", requireAuth, async (req: AuthRequest, res): Promise<void> => {
  const id = parseInt(req.params.id as string, 10);
  const update = req.body;
  const [inst] = await db.update(institutionsTable).set(update).where(eq(institutionsTable.id, id)).returning();
  if (!inst) { res.status(404).json({ error: "Not found" }); return; }
  res.json(inst);
});

router.post("/institutions/:id/approve", requireAuth, async (req: AuthRequest, res): Promise<void> => {
  const id = parseInt(req.params.id as string, 10);
  const [inst] = await db.update(institutionsTable).set({ status: "approved", subscriptionStatus: "active" }).where(eq(institutionsTable.id, id)).returning();
  if (!inst) { res.status(404).json({ error: "Not found" }); return; }
  res.json(inst);
});

router.get("/institutions/:id/fee-structure", async (req, res): Promise<void> => {
  const id = parseInt(req.params.id as string, 10);
  const [fee] = await db.select().from(feeStructuresTable).where(eq(feeStructuresTable.institutionId, id));
  if (!fee) { res.status(404).json({ error: "Not found" }); return; }
  res.json({ ...fee, tuitionFee: parseFloat(fee.tuitionFee), boardingFee: parseFloat(fee.boardingFee), activityFee: parseFloat(fee.activityFee), admissionFee: parseFloat(fee.admissionFee), otherFees: fee.otherFees ? parseFloat(fee.otherFees) : null });
});

router.put("/institutions/:id/fee-structure", requireAuth, async (req: AuthRequest, res): Promise<void> => {
  const id = parseInt(req.params.id as string, 10);
  const { tuitionFee, boardingFee, activityFee, admissionFee, otherFees, notes } = req.body;
  const existing = await db.select().from(feeStructuresTable).where(eq(feeStructuresTable.institutionId, id));
  let fee;
  if (existing.length > 0) {
    [fee] = await db.update(feeStructuresTable).set({ tuitionFee: String(tuitionFee), boardingFee: String(boardingFee), activityFee: String(activityFee), admissionFee: String(admissionFee), otherFees: String(otherFees ?? 0), notes }).where(eq(feeStructuresTable.institutionId, id)).returning();
  } else {
    [fee] = await db.insert(feeStructuresTable).values({ institutionId: id, tuitionFee: String(tuitionFee), boardingFee: String(boardingFee), activityFee: String(activityFee), admissionFee: String(admissionFee), otherFees: String(otherFees ?? 0), notes }).returning();
  }
  res.json({ ...fee, tuitionFee: parseFloat(fee.tuitionFee), boardingFee: parseFloat(fee.boardingFee), activityFee: parseFloat(fee.activityFee), admissionFee: parseFloat(fee.admissionFee), otherFees: fee.otherFees ? parseFloat(fee.otherFees) : null });
});

export default router;
