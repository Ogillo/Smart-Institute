import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
import { db, documentsTable } from "@workspace/db";
import { requireAuth, type AuthRequest } from "../middlewares/auth";

const router: IRouter = Router();

router.get("/documents", requireAuth, async (req: AuthRequest, res): Promise<void> => {
  const { applicationId } = req.query;
  if (!applicationId) { res.status(400).json({ error: "applicationId required" }); return; }
  const docs = await db.select().from(documentsTable).where(eq(documentsTable.applicationId, Number(applicationId)));
  res.json(docs);
});

router.post("/documents", requireAuth, async (req: AuthRequest, res): Promise<void> => {
  const { applicationId, documentType, fileUrl } = req.body;
  if (!applicationId || !documentType || !fileUrl) { res.status(400).json({ error: "applicationId, documentType, fileUrl required" }); return; }

  // Upsert — replace existing of same type
  const existing = await db.select().from(documentsTable).where(eq(documentsTable.applicationId, Number(applicationId)));
  const sameType = existing.find(d => d.documentType === documentType);
  if (sameType) {
    const [d] = await db.update(documentsTable).set({ fileUrl, status: "pending", rejectionReason: null }).where(eq(documentsTable.id, sameType.id)).returning();
    res.status(201).json(d);
    return;
  }
  const [d] = await db.insert(documentsTable).values({ applicationId: Number(applicationId), documentType, fileUrl }).returning();
  res.status(201).json(d);
});

router.post("/documents/:id/verify", requireAuth, async (req: AuthRequest, res): Promise<void> => {
  const id = parseInt(req.params.id as string, 10);
  const { status, rejectionReason } = req.body;
  const verifiedBy = req.dbUser?.id ?? null;
  const [d] = await db.update(documentsTable).set({ status, rejectionReason: rejectionReason ?? null, verifiedBy }).where(eq(documentsTable.id, id)).returning();
  if (!d) { res.status(404).json({ error: "Not found" }); return; }
  res.json(d);
});

export default router;
