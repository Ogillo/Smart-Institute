import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
import { db, inventoryTable, requirementOrdersTable } from "@workspace/db";
import { requireAuth, type AuthRequest } from "../middlewares/auth";

const router: IRouter = Router();

router.get("/inventory", requireAuth, async (req: AuthRequest, res): Promise<void> => {
  const { institutionId } = req.query;
  if (!institutionId) { res.status(400).json({ error: "institutionId required" }); return; }
  const items = await db.select().from(inventoryTable).where(eq(inventoryTable.institutionId, Number(institutionId)));
  res.json(items.map(i => ({
    ...i,
    unitCost: parseFloat(i.unitCost),
    isLowStock: i.quantityAvailable < 10,
  })));
});

router.post("/inventory", requireAuth, async (req: AuthRequest, res): Promise<void> => {
  const { institutionId, name, description, category, requiredQuantity, unitCost, quantityAvailable } = req.body;
  if (!institutionId || !name || !unitCost) { res.status(400).json({ error: "institutionId, name, unitCost required" }); return; }
  const [i] = await db.insert(inventoryTable).values({ institutionId: Number(institutionId), name, description, category, requiredQuantity: Number(requiredQuantity ?? 1), unitCost: String(unitCost), quantityAvailable: Number(quantityAvailable ?? 0) }).returning();
  res.status(201).json({ ...i, unitCost: parseFloat(i.unitCost), isLowStock: i.quantityAvailable < 10 });
});

router.patch("/inventory/:id", requireAuth, async (req: AuthRequest, res): Promise<void> => {
  const id = parseInt(req.params.id as string, 10);
  const { name, description, category, requiredQuantity, unitCost, quantityAvailable } = req.body;
  const update: any = {};
  if (name) update.name = name;
  if (description !== undefined) update.description = description;
  if (category !== undefined) update.category = category;
  if (requiredQuantity !== undefined) update.requiredQuantity = Number(requiredQuantity);
  if (unitCost !== undefined) update.unitCost = String(unitCost);
  if (quantityAvailable !== undefined) update.quantityAvailable = Number(quantityAvailable);
  const [i] = await db.update(inventoryTable).set(update).where(eq(inventoryTable.id, id)).returning();
  if (!i) { res.status(404).json({ error: "Not found" }); return; }
  res.json({ ...i, unitCost: parseFloat(i.unitCost), isLowStock: i.quantityAvailable < 10 });
});

router.delete("/inventory/:id", requireAuth, async (req: AuthRequest, res): Promise<void> => {
  const id = parseInt(req.params.id as string, 10);
  await db.delete(inventoryTable).where(eq(inventoryTable.id, id));
  res.sendStatus(204);
});

router.get("/requirement-orders", requireAuth, async (req: AuthRequest, res): Promise<void> => {
  const { applicationId } = req.query;
  if (!applicationId) { res.status(400).json({ error: "applicationId required" }); return; }
  const orders = await db.select().from(requirementOrdersTable).where(eq(requirementOrdersTable.applicationId, Number(applicationId)));
  res.json(orders.map(o => ({ ...o, totalAmount: parseFloat(o.totalAmount) })));
});

router.post("/requirement-orders", requireAuth, async (req: AuthRequest, res): Promise<void> => {
  const { applicationId, items } = req.body;
  if (!applicationId || !items) { res.status(400).json({ error: "applicationId, items required" }); return; }
  const totalAmount = (items as any[]).filter(i => i.purchaseFromSchool).reduce((sum: number, i: any) => sum + (i.quantity * i.unitCost), 0);
  const [o] = await db.insert(requirementOrdersTable).values({ applicationId: Number(applicationId), items, totalAmount: String(totalAmount) }).returning();
  res.status(201).json({ ...o, totalAmount: parseFloat(o.totalAmount) });
});

export default router;
