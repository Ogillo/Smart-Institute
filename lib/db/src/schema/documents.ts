import { pgTable, text, serial, timestamp, integer, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { applicationsTable } from "./applications";
import { usersTable } from "./users";

export const documentTypeEnum = pgEnum("document_type", [
  "admission_letter",
  "birth_certificate",
  "result_slip",
  "passport_photo",
  "medical_form",
  "leaving_certificate",
  "transfer_letter",
  "nemis",
]);

export const documentStatusEnum = pgEnum("document_status", ["pending", "approved", "rejected"]);

export const documentsTable = pgTable("documents", {
  id: serial("id").primaryKey(),
  applicationId: integer("application_id").notNull().references(() => applicationsTable.id),
  documentType: documentTypeEnum("document_type").notNull(),
  fileUrl: text("file_url").notNull(),
  status: documentStatusEnum("status").notNull().default("pending"),
  rejectionReason: text("rejection_reason"),
  verifiedBy: integer("verified_by").references(() => usersTable.id),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const insertDocumentSchema = createInsertSchema(documentsTable).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertDocument = z.infer<typeof insertDocumentSchema>;
export type Document = typeof documentsTable.$inferSelect;
