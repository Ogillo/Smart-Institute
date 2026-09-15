import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
import { db, usersTable, institutionsTable } from "@workspace/db";
import { requireAuth, type AuthRequest } from "../middlewares/auth";

const router: IRouter = Router();

router.post("/users/sync", async (req: AuthRequest, res): Promise<void> => {
  const { clerkId, email, fullName } = req.body;
  if (!clerkId || !email) {
    res.status(400).json({ error: "clerkId and email required" });
    return;
  }
  const existing = await db.select().from(usersTable).where(eq(usersTable.clerkId, clerkId));
  if (existing.length > 0) {
    const [u] = await db.update(usersTable).set({ email, fullName: fullName ?? existing[0].fullName }).where(eq(usersTable.clerkId, clerkId)).returning();
    res.json(u);
    return;
  }
  const [u] = await db.insert(usersTable).values({ clerkId, email, fullName }).returning();
  res.json(u);
});

router.get("/users/me", requireAuth, async (req: AuthRequest, res): Promise<void> => {
  if (!req.dbUser) {
    res.status(404).json({ error: "User not found" });
    return;
  }
  let institution = null;
  if (req.dbUser.institutionId) {
    const [inst] = await db.select({ id: institutionsTable.id, name: institutionsTable.name, level: institutionsTable.level, logoUrl: institutionsTable.logoUrl }).from(institutionsTable).where(eq(institutionsTable.id, req.dbUser.institutionId));
    institution = inst ?? null;
  }
  res.json({ ...req.dbUser, institution });
});

router.patch("/users/me", requireAuth, async (req: AuthRequest, res): Promise<void> => {
  if (!req.dbUser) { res.status(404).json({ error: "Not found" }); return; }
  const { fullName, phone } = req.body;
  const [u] = await db.update(usersTable).set({ fullName, phone }).where(eq(usersTable.id, req.dbUser.id)).returning();
  res.json(u);
});

router.get("/users", requireAuth, async (req: AuthRequest, res): Promise<void> => {
  const { role, institutionId } = req.query;
  let query = db.select().from(usersTable).$dynamic();
  if (role) query = query.where(eq(usersTable.role, role as any));
  if (institutionId) query = query.where(eq(usersTable.institutionId, Number(institutionId)));
  const users = await query;
  res.json(users);
});

router.get("/users/:id", requireAuth, async (req: AuthRequest, res): Promise<void> => {
  const id = parseInt(req.params.id as string, 10);
  const [u] = await db.select().from(usersTable).where(eq(usersTable.id, id));
  if (!u) { res.status(404).json({ error: "Not found" }); return; }
  res.json(u);
});

router.patch("/users/:id", requireAuth, async (req: AuthRequest, res): Promise<void> => {
  const id = parseInt(req.params.id as string, 10);
  const { role, institutionId, fullName, phone } = req.body;
  const [u] = await db.update(usersTable).set({ role, institutionId: institutionId ?? null, fullName, phone }).where(eq(usersTable.id, id)).returning();
  if (!u) { res.status(404).json({ error: "Not found" }); return; }
  res.json(u);
});

export default router;
