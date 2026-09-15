import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
import { db, studentAllocationsTable, streamsTable, dormitoriesTable, applicationsTable } from "@workspace/db";
import { requireAuth, type AuthRequest } from "../middlewares/auth";

const router: IRouter = Router();

const enrichAllocation = async (a: any) => {
  let streamName = null;
  let dormitoryName = null;
  if (a.streamId) {
    const [s] = await db.select({ name: streamsTable.name }).from(streamsTable).where(eq(streamsTable.id, a.streamId));
    streamName = s?.name ?? null;
  }
  if (a.dormitoryId) {
    const [d] = await db.select({ name: dormitoriesTable.name }).from(dormitoriesTable).where(eq(dormitoriesTable.id, a.dormitoryId));
    dormitoryName = d?.name ?? null;
  }
  return { ...a, streamName, dormitoryName };
};

router.get("/allocations", requireAuth, async (req: AuthRequest, res): Promise<void> => {
  const { institutionId } = req.query;
  const allocations = await db.select().from(studentAllocationsTable);
  const result = await Promise.all(allocations.map(enrichAllocation));
  res.json(result);
});

router.post("/allocations", requireAuth, async (req: AuthRequest, res): Promise<void> => {
  const { applicationId, admissionNumber, streamId, dormitoryId, teacherName, teacherPhone, reportingDate, reportingTime } = req.body;
  if (!applicationId) { res.status(400).json({ error: "applicationId required" }); return; }
  const existing = await db.select().from(studentAllocationsTable).where(eq(studentAllocationsTable.applicationId, Number(applicationId)));
  let alloc;
  if (existing.length > 0) {
    [alloc] = await db.update(studentAllocationsTable).set({ admissionNumber, streamId: streamId ?? null, dormitoryId: dormitoryId ?? null, teacherName, teacherPhone, reportingDate, reportingTime }).where(eq(studentAllocationsTable.applicationId, Number(applicationId))).returning();
  } else {
    [alloc] = await db.insert(studentAllocationsTable).values({ applicationId: Number(applicationId), admissionNumber, streamId: streamId ?? null, dormitoryId: dormitoryId ?? null, teacherName, teacherPhone, reportingDate, reportingTime }).returning();
    // Update dormitory occupancy
    if (dormitoryId) {
      await db.execute(`UPDATE dormitories SET occupancy = occupancy + 1 WHERE id = ${Number(dormitoryId)}`);
    }
  }
  res.status(201).json(await enrichAllocation(alloc));
});

router.patch("/allocations/:id", requireAuth, async (req: AuthRequest, res): Promise<void> => {
  const id = parseInt(req.params.id as string, 10);
  const { admissionNumber, streamId, dormitoryId, teacherName, teacherPhone, reportingDate, reportingTime } = req.body;
  const [alloc] = await db.update(studentAllocationsTable).set({ admissionNumber, streamId: streamId ?? null, dormitoryId: dormitoryId ?? null, teacherName, teacherPhone, reportingDate, reportingTime }).where(eq(studentAllocationsTable.id, id)).returning();
  if (!alloc) { res.status(404).json({ error: "Not found" }); return; }
  res.json(await enrichAllocation(alloc));
});

export default router;
