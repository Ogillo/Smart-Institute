import { Router, type IRouter } from "express";
import { eq, ilike, and } from "drizzle-orm";
import { db, applicationsTable, institutionsTable, studentsTable, admissionCodesTable } from "@workspace/db";
import { requireAuth, type AuthRequest } from "../middlewares/auth";

const router: IRouter = Router();

router.get("/applications", requireAuth, async (req: AuthRequest, res): Promise<void> => {
  const { institutionId, status, search } = req.query as Record<string, string>;
  const user = req.dbUser;
  let apps = await db.select().from(applicationsTable).orderBy(applicationsTable.createdAt);

  if (user?.role === "parent") {
    apps = apps.filter(a => a.userId === user.id);
  } else if (institutionId) {
    apps = apps.filter(a => a.institutionId === Number(institutionId));
  } else if (user?.institutionId) {
    apps = apps.filter(a => a.institutionId === user.institutionId);
  }

  if (status) apps = apps.filter(a => a.status === status);

  const result = await Promise.all(apps.map(async (app) => {
    const [institution] = await db.select({ id: institutionsTable.id, name: institutionsTable.name, level: institutionsTable.level, logoUrl: institutionsTable.logoUrl }).from(institutionsTable).where(eq(institutionsTable.id, app.institutionId));
    const [student] = await db.select().from(studentsTable).where(eq(studentsTable.applicationId, app.id));
    if (search && student && !student.fullName.toLowerCase().includes(search.toLowerCase())) return null;
    return { ...app, institution, student: student ?? null };
  }));
  res.json(result.filter(Boolean));
});

router.post("/applications", requireAuth, async (req: AuthRequest, res): Promise<void> => {
  const { institutionId } = req.body;
  if (!institutionId) { res.status(400).json({ error: "institutionId required" }); return; }
  const userId = req.dbUser?.id;
  if (!userId) { res.status(401).json({ error: "Unauthorized" }); return; }
  const [app] = await db.insert(applicationsTable).values({ userId, institutionId: Number(institutionId) }).returning();
  const [institution] = await db.select({ id: institutionsTable.id, name: institutionsTable.name, level: institutionsTable.level, logoUrl: institutionsTable.logoUrl }).from(institutionsTable).where(eq(institutionsTable.id, institutionId));
  res.status(201).json({ ...app, institution, student: null });
});

router.get("/applications/:id", requireAuth, async (req: AuthRequest, res): Promise<void> => {
  const id = parseInt(req.params.id as string, 10);
  const [app] = await db.select().from(applicationsTable).where(eq(applicationsTable.id, id));
  if (!app) { res.status(404).json({ error: "Not found" }); return; }
  const [institution] = await db.select({ id: institutionsTable.id, name: institutionsTable.name, level: institutionsTable.level, logoUrl: institutionsTable.logoUrl }).from(institutionsTable).where(eq(institutionsTable.id, app.institutionId));
  const [student] = await db.select().from(studentsTable).where(eq(studentsTable.applicationId, id));
  res.json({ ...app, institution, student: student ?? null });
});

router.patch("/applications/:id", requireAuth, async (req: AuthRequest, res): Promise<void> => {
  const id = parseInt(req.params.id as string, 10);
  const { step, status, admissionCode } = req.body;
  const update: any = {};
  if (step !== undefined) update.step = step;
  if (status) update.status = status;
  if (admissionCode) update.admissionCode = admissionCode;
  const [app] = await db.update(applicationsTable).set(update).where(eq(applicationsTable.id, id)).returning();
  if (!app) { res.status(404).json({ error: "Not found" }); return; }
  const [institution] = await db.select({ id: institutionsTable.id, name: institutionsTable.name, level: institutionsTable.level, logoUrl: institutionsTable.logoUrl }).from(institutionsTable).where(eq(institutionsTable.id, app.institutionId));
  const [student] = await db.select().from(studentsTable).where(eq(studentsTable.applicationId, id));
  res.json({ ...app, institution, student: student ?? null });
});

router.post("/applications/:id/approve", requireAuth, async (req: AuthRequest, res): Promise<void> => {
  const id = parseInt(req.params.id as string, 10);
  const [app] = await db.update(applicationsTable).set({ status: "approved" }).where(eq(applicationsTable.id, id)).returning();
  if (!app) { res.status(404).json({ error: "Not found" }); return; }
  res.json(app);
});

router.post("/applications/:id/reject", requireAuth, async (req: AuthRequest, res): Promise<void> => {
  const id = parseInt(req.params.id as string, 10);
  const { reason } = req.body;
  const [app] = await db.update(applicationsTable).set({ status: "rejected", rejectionReason: reason }).where(eq(applicationsTable.id, id)).returning();
  if (!app) { res.status(404).json({ error: "Not found" }); return; }
  res.json(app);
});

router.post("/applications/:id/checkin", requireAuth, async (req: AuthRequest, res): Promise<void> => {
  const id = parseInt(req.params.id as string, 10);
  const [app] = await db.update(applicationsTable).set({ status: "checked_in", checkedInAt: new Date() }).where(eq(applicationsTable.id, id)).returning();
  if (!app) { res.status(404).json({ error: "Not found" }); return; }
  res.json(app);
});

router.post("/applications/verify-code", requireAuth, async (req: AuthRequest, res): Promise<void> => {
  const { code, institutionId } = req.body;
  if (!code) { res.status(400).json({ error: "code required" }); return; }
  const [ac] = await db.select().from(admissionCodesTable).where(eq(admissionCodesTable.code, code));
  if (!ac || ac.institutionId !== Number(institutionId)) {
    res.json({ valid: false, message: "Invalid or unrecognized admission code" });
    return;
  }
  if (ac.used) {
    res.json({ valid: false, message: "This code has already been used" });
    return;
  }
  const [inst] = await db.select({ name: institutionsTable.name }).from(institutionsTable).where(eq(institutionsTable.id, ac.institutionId));
  res.json({ valid: true, studentName: ac.studentName, institutionName: inst?.name, reportingDate: ac.reportingDate, message: "Code verified successfully" });
});

export default router;
