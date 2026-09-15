import { pgTable, text, serial, timestamp, integer, boolean, jsonb, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { institutionsTable } from "./institutions";
import { applicationsTable } from "./applications";

export const inventoryTable = pgTable("inventory_items", {
  id: serial("id").primaryKey(),
  institutionId: integer("institution_id").notNull().references(() => institutionsTable.id),
  name: text("name").notNull(),
  description: text("description"),
  category: text("category"),
  requiredQuantity: integer("required_quantity").notNull().default(1),
  unitCost: text("unit_cost").notNull().default("0"),
  quantityAvailable: integer("quantity_available").notNull().default(0),
  quantitySold: integer("quantity_sold").notNull().default(0),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const requirementOrdersTable = pgTable("requirement_orders", {
  id: serial("id").primaryKey(),
  applicationId: integer("application_id").notNull().references(() => applicationsTable.id),
  items: jsonb("items").notNull().default([]),
  totalAmount: text("total_amount").notNull().default("0"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertInventorySchema = createInsertSchema(inventoryTable).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertInventory = z.infer<typeof insertInventorySchema>;
export type Inventory = typeof inventoryTable.$inferSelect;
