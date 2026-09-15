import { pgTable, text, serial, timestamp, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { institutionsTable } from "./institutions";

export const classesTable = pgTable("classes", {
  id: serial("id").primaryKey(),
  institutionId: integer("institution_id").notNull().references(() => institutionsTable.id),
  name: text("name").notNull(),
  level: text("level"),
  academicYear: text("academic_year").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const streamsTable = pgTable("streams", {
  id: serial("id").primaryKey(),
  classId: integer("class_id").notNull().references(() => classesTable.id),
  name: text("name").notNull(),
  teacherName: text("teacher_name"),
  teacherPhone: text("teacher_phone"),
  capacity: integer("capacity").default(40),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertClassSchema = createInsertSchema(classesTable).omit({ id: true, createdAt: true });
export type InsertClass = z.infer<typeof insertClassSchema>;
export type Class = typeof classesTable.$inferSelect;

export const insertStreamSchema = createInsertSchema(streamsTable).omit({ id: true, createdAt: true });
export type InsertStream = z.infer<typeof insertStreamSchema>;
export type Stream = typeof streamsTable.$inferSelect;
