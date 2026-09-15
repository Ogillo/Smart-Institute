import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
import { db, notificationsTable } from "@workspace/db";
import { requireAuth, type AuthRequest } from "../middlewares/auth";

const router: IRouter = Router();

router.get("/notifications", requireAuth, async (req: AuthRequest, res): Promise<void> => {
  const { unreadOnly } = req.query;
  const userId = req.dbUser?.id;
  if (!userId) { res.status(401).json({ error: "Unauthorized" }); return; }
  let notifs = await db.select().from(notificationsTable).where(eq(notificationsTable.userId, userId));
  if (unreadOnly === "true") notifs = notifs.filter(n => !n.isRead);
  notifs.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  res.json(notifs);
});

router.post("/notifications/:id/read", requireAuth, async (req: AuthRequest, res): Promise<void> => {
  const id = parseInt(req.params.id as string, 10);
  const [n] = await db.update(notificationsTable).set({ isRead: true }).where(eq(notificationsTable.id, id)).returning();
  if (!n) { res.status(404).json({ error: "Not found" }); return; }
  res.json(n);
});

router.post("/notifications/send", requireAuth, async (req: AuthRequest, res): Promise<void> => {
  const { userIds, type, title, message } = req.body;
  if (!userIds || !type || !title || !message) { res.status(400).json({ error: "userIds, type, title, message required" }); return; }
  const insertions = (userIds as number[]).map((userId: number) =>
    db.insert(notificationsTable).values({ userId, type, title, message }).returning()
  );
  const results = await Promise.all(insertions);
  res.status(201).json(results[0]?.[0] ?? null);
});

export default router;
