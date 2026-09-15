import { pgTable, text, serial, timestamp, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { applicationsTable } from "./applications";
import { streamsTable } from "./classes";
import { dormitoriesTable } from "./dormitories";

export const studentAllocationsTable = pgTable("student_allocations", {
  id: serial("id").primaryKey(),
  applicationId: integer("application_id").notNull().references(() => applicationsTable.id).unique(),
  admissionNumber: text("admission_number"),
  streamId: integer("stream_id").references(() => streamsTable.id),
  dormitoryId: integer("dormitory_id").references(() => dormitoriesTable.id),
  teacherName: text("teacher_name"),
  teacherPhone: text("teacher_phone"),
  reportingDate: text("reporting_date"),
  reportingTime: text("reporting_time"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const insertAllocationSchema = createInsertSchema(studentAllocationsTable).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertAllocation = z.infer<typeof insertAllocationSchema>;
export type StudentAllocation = typeof studentAllocationsTable.$inferSelect;
