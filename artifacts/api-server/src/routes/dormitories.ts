import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
import { db, dormitoriesTable } from "@workspace/db";
import { requireAuth, type AuthRequest } from "../middlewares/auth";

const router: IRouter = Router();

const formatDorm = (d: any) => ({
  ...d,
  occupancyPercent: d.capacity > 0 ? Math.round((d.occupancy / d.capacity) * 100) : 0,
});

router.get("/dormitories", requireAuth, async (req: AuthRequest, res): Promise<void> => {
  const { institutionId } = req.query;
  if (!institutionId) { res.status(400).json({ error: "institutionId required" }); return; }
  const dorms = await db.select().from(dormitoriesTable).where(eq(dormitoriesTable.institutionId, Number(institutionId)));
  res.json(dorms.map(formatDorm));
});

router.post("/dormitories", requireAuth, async (req: AuthRequest, res): Promise<void> => {
  const { institutionId, name, gender, capacity, dormitoryMaster, dormitoryMasterPhone } = req.body;
  if (!institutionId || !name || !capacity) { res.status(400).json({ error: "institutionId, name, capacity required" }); return; }
  const [d] = await db.insert(dormitoriesTable).values({ institutionId: Number(institutionId), name, gender, capacity: Number(capacity), dormitoryMaster, dormitoryMasterPhone }).returning();
  res.status(201).json(formatDorm(d));
});

router.patch("/dormitories/:id", requireAuth, async (req: AuthRequest, res): Promise<void> => {
  const id = parseInt(req.params.id as string, 10);
  const { name, gender, capacity, dormitoryMaster, dormitoryMasterPhone } = req.body;
  const update: any = {};
  if (name) update.name = name;
  if (gender !== undefined) update.gender = gender;
  if (capacity !== undefined) update.capacity = Number(capacity);
  if (dormitoryMaster !== undefined) update.dormitoryMaster = dormitoryMaster;
  if (dormitoryMasterPhone !== undefined) update.dormitoryMasterPhone = dormitoryMasterPhone;
  const [d] = await db.update(dormitoriesTable).set(update).where(eq(dormitoriesTable.id, id)).returning();
  if (!d) { res.status(404).json({ error: "Not found" }); return; }
  res.json(formatDorm(d));
});

export default router;
