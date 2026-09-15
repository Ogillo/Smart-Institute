import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
import { db, auditLogsTable } from "@workspace/db";
import { requireAuth, type AuthRequest } from "../middlewares/auth";

const router: IRouter = Router();

router.get("/audit-logs", requireAuth, async (req: AuthRequest, res): Promise<void> => {
  const { institutionId, userId, limit } = req.query as Record<string, string>;
  let logs = await db.select().from(auditLogsTable).orderBy(auditLogsTable.createdAt);
  if (institutionId) logs = logs.filter(l => l.institutionId === Number(institutionId));
  if (userId) logs = logs.filter(l => l.userId === Number(userId));
  if (limit) logs = logs.slice(0, Number(limit));
  res.json(logs);
});

export default router;
