import { getAuth } from "@clerk/express";
import type { Request, Response, NextFunction } from "express";
import { db, usersTable } from "@workspace/db";
import { eq } from "drizzle-orm";

export interface AuthRequest extends Request {
  dbUser?: typeof usersTable.$inferSelect;
  clerkUserId?: string;
}

export const requireAuth = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  const auth = getAuth(req);
  const clerkUserId = auth?.userId;
  if (!clerkUserId) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  req.clerkUserId = clerkUserId;

  try {
    const [user] = await db.select().from(usersTable).where(eq(usersTable.clerkId, clerkUserId));
    if (user) {
      req.dbUser = user;
    }
  } catch (err) {
    req.log.warn({ err }, "Failed to fetch db user in auth middleware");
  }
  next();
};

export const requireRole = (...roles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    const role = req.dbUser?.role;
    if (!role || !roles.includes(role)) {
      res.status(403).json({ error: "Forbidden" });
      return;
    }
    next();
  };
};
