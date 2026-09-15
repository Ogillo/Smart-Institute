import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
import { db, paymentsTable, receiptsTable, applicationsTable, studentsTable, institutionsTable } from "@workspace/db";
import { requireAuth, type AuthRequest } from "../middlewares/auth";

const router: IRouter = Router();

const formatPayment = (p: any) => ({
  ...p,
  amount: parseFloat(p.amount),
});

router.get("/payments", requireAuth, async (req: AuthRequest, res): Promise<void> => {
  const { applicationId, institutionId, status } = req.query as Record<string, string>;
  let payments = await db.select().from(paymentsTable).orderBy(paymentsTable.createdAt);
  if (applicationId) payments = payments.filter(p => p.applicationId === Number(applicationId));
  if (status) payments = payments.filter(p => p.status === status);
  res.json(payments.map(formatPayment));
});

router.post("/payments", requireAuth, async (req: AuthRequest, res): Promise<void> => {
  const { applicationId, amount, method, transactionId, breakdown } = req.body;
  if (!applicationId || !amount || !method) { res.status(400).json({ error: "applicationId, amount, method required" }); return; }
  const receiptNumber = `RCP-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
  const [p] = await db.insert(paymentsTable).values({ applicationId: Number(applicationId), amount: String(amount), method, transactionId, breakdown, receiptNumber, status: "confirmed" }).returning();

  // Update application payment status
  await db.update(applicationsTable).set({ paymentStatus: "paid" }).where(eq(applicationsTable.id, Number(applicationId)));

  // Create receipt
  const [app] = await db.select().from(applicationsTable).where(eq(applicationsTable.id, Number(applicationId)));
  const [student] = app ? await db.select().from(studentsTable).where(eq(studentsTable.applicationId, app.id)) : [];
  const [institution] = app ? await db.select({ name: institutionsTable.name }).from(institutionsTable).where(eq(institutionsTable.id, app.institutionId)) : [];
  if (student && institution) {
    await db.insert(receiptsTable).values({ paymentId: p.id, receiptNumber, studentName: student.fullName, institutionName: institution.name, amount: String(amount) }).catch(() => {});
  }

  res.status(201).json(formatPayment(p));
});

router.get("/payments/:id", requireAuth, async (req: AuthRequest, res): Promise<void> => {
  const id = parseInt(req.params.id as string, 10);
  const [p] = await db.select().from(paymentsTable).where(eq(paymentsTable.id, id));
  if (!p) { res.status(404).json({ error: "Not found" }); return; }
  res.json(formatPayment(p));
});

router.post("/payments/:id/verify", requireAuth, async (req: AuthRequest, res): Promise<void> => {
  const id = parseInt(req.params.id as string, 10);
  const [p] = await db.update(paymentsTable).set({ status: "confirmed" }).where(eq(paymentsTable.id, id)).returning();
  if (!p) { res.status(404).json({ error: "Not found" }); return; }
  res.json(formatPayment(p));
});

router.get("/receipts/:id", requireAuth, async (req: AuthRequest, res): Promise<void> => {
  const id = parseInt(req.params.id as string, 10);
  const [r] = await db.select().from(receiptsTable).where(eq(receiptsTable.id, id));
  if (!r) { res.status(404).json({ error: "Not found" }); return; }
  res.json({ ...r, amount: parseFloat(r.amount) });
});

export default router;
