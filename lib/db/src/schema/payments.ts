import { pgTable, text, serial, timestamp, integer, jsonb, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { applicationsTable } from "./applications";

export const paymentMethodEnum = pgEnum("payment_method", ["mpesa", "airtel_money", "bank_transfer", "card"]);
export const paymentConfirmStatusEnum = pgEnum("payment_confirm_status", ["pending", "confirmed", "failed"]);

export const paymentsTable = pgTable("payments", {
  id: serial("id").primaryKey(),
  applicationId: integer("application_id").notNull().references(() => applicationsTable.id),
  receiptNumber: text("receipt_number"),
  transactionId: text("transaction_id"),
  amount: text("amount").notNull().default("0"),
  method: paymentMethodEnum("method").notNull(),
  status: paymentConfirmStatusEnum("status").notNull().default("pending"),
  breakdown: jsonb("breakdown"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const receiptsTable = pgTable("receipts", {
  id: serial("id").primaryKey(),
  paymentId: integer("payment_id").notNull().references(() => paymentsTable.id).unique(),
  receiptNumber: text("receipt_number").notNull(),
  studentName: text("student_name").notNull(),
  institutionName: text("institution_name").notNull(),
  amount: text("amount").notNull(),
  issuedAt: timestamp("issued_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertPaymentSchema = createInsertSchema(paymentsTable).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertPayment = z.infer<typeof insertPaymentSchema>;
export type Payment = typeof paymentsTable.$inferSelect;
