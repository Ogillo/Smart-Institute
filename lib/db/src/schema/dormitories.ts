import { pgTable, text, serial, timestamp, integer, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { institutionsTable } from "./institutions";

export const dormGenderEnum = pgEnum("dorm_gender", ["male", "female", "mixed"]);

export const dormitoriesTable = pgTable("dormitories", {
  id: serial("id").primaryKey(),
  institutionId: integer("institution_id").notNull().references(() => institutionsTable.id),
  name: text("name").notNull(),
  gender: dormGenderEnum("gender"),
  capacity: integer("capacity").notNull().default(0),
  occupancy: integer("occupancy").notNull().default(0),
  dormitoryMaster: text("dormitory_master"),
  dormitoryMasterPhone: text("dormitory_master_phone"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const insertDormitorySchema = createInsertSchema(dormitoriesTable).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertDormitory = z.infer<typeof insertDormitorySchema>;
export type Dormitory = typeof dormitoriesTable.$inferSelect;
