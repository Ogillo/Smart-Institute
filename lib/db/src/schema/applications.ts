import { pgTable, text, serial, timestamp, integer, boolean, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { institutionsTable } from "./institutions";
import { usersTable } from "./users";

export const applicationStatusEnum = pgEnum("application_status", [
  "draft",
  "pending",
  "under_review",
  "approved",
  "rejected",
  "checked_in",
]);

export const paymentStatusEnum = pgEnum("payment_status_enum", ["unpaid", "partial", "paid"]);

export const applicationsTable = pgTable("applications", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => usersTable.id),
  institutionId: integer("institution_id").notNull().references(() => institutionsTable.id),
  status: applicationStatusEnum("status").notNull().default("draft"),
  step: integer("step").notNull().default(1),
  admissionCodeVerified: boolean("admission_code_verified").notNull().default(false),
  admissionCode: text("admission_code"),
  documentsApproved: boolean("documents_approved").notNull().default(false),
  paymentStatus: paymentStatusEnum("payment_status").notNull().default("unpaid"),
  checkedInAt: timestamp("checked_in_at", { withTimezone: true }),
  rejectionReason: text("rejection_reason"),
  reportingDate: text("reporting_date"),
  reportingTime: text("reporting_time"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const admissionCodesTable = pgTable("admission_codes", {
  id: serial("id").primaryKey(),
  code: text("code").notNull().unique(),
  institutionId: integer("institution_id").notNull().references(() => institutionsTable.id),
  studentName: text("student_name").notNull(),
  reportingDate: text("reporting_date"),
  used: boolean("used").notNull().default(false),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertApplicationSchema = createInsertSchema(applicationsTable).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertApplication = z.infer<typeof insertApplicationSchema>;
export type Application = typeof applicationsTable.$inferSelect;
