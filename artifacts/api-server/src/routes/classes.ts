import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
import { db, classesTable, streamsTable, studentAllocationsTable } from "@workspace/db";
import { requireAuth, type AuthRequest } from "../middlewares/auth";

const router: IRouter = Router();

router.get("/classes", requireAuth, async (req: AuthRequest, res): Promise<void> => {
  const { institutionId } = req.query;
  if (!institutionId) { res.status(400).json({ error: "institutionId required" }); return; }
  const classes = await db.select().from(classesTable).where(eq(classesTable.institutionId, Number(institutionId)));
  const result = await Promise.all(classes.map(async (c) => {
    const streams = await db.select().from(streamsTable).where(eq(streamsTable.classId, c.id));
    const streamsWithCount = await Promise.all(streams.map(async (s) => {
      const allocs = await db.select().from(studentAllocationsTable).where(eq(studentAllocationsTable.streamId, s.id));
      return { ...s, enrolled: allocs.length };
    }));
    return { ...c, streams: streamsWithCount };
  }));
  res.json(result);
});

router.post("/classes", requireAuth, async (req: AuthRequest, res): Promise<void> => {
  const { institutionId, name, level, academicYear } = req.body;
  if (!institutionId || !name || !academicYear) { res.status(400).json({ error: "institutionId, name, academicYear required" }); return; }
  const [c] = await db.insert(classesTable).values({ institutionId: Number(institutionId), name, level, academicYear }).returning();
  res.status(201).json({ ...c, streams: [] });
});

router.get("/streams", requireAuth, async (req: AuthRequest, res): Promise<void> => {
  const { classId } = req.query;
  if (!classId) { res.status(400).json({ error: "classId required" }); return; }
  const streams = await db.select().from(streamsTable).where(eq(streamsTable.classId, Number(classId)));
  const result = await Promise.all(streams.map(async (s) => {
    const allocs = await db.select().from(studentAllocationsTable).where(eq(studentAllocationsTable.streamId, s.id));
    return { ...s, enrolled: allocs.length };
  }));
  res.json(result);
});

router.post("/streams", requireAuth, async (req: AuthRequest, res): Promise<void> => {
  const { classId, name, teacherName, teacherPhone, capacity } = req.body;
  if (!classId || !name) { res.status(400).json({ error: "classId, name required" }); return; }
  const [s] = await db.insert(streamsTable).values({ classId: Number(classId), name, teacherName, teacherPhone, capacity: Number(capacity ?? 40) }).returning();
  res.status(201).json({ ...s, enrolled: 0 });
});

export default router;
