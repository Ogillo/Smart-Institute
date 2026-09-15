import { pgTable, text, serial, timestamp, integer, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const institutionLevelEnum = pgEnum("institution_level", ["secondary", "college", "university"]);
export const institutionStatusEnum = pgEnum("institution_status", ["pending", "approved", "suspended"]);
export const subscriptionStatusEnum = pgEnum("subscription_status", ["active", "inactive", "trial"]);

export const institutionsTable = pgTable("institutions", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  level: institutionLevelEnum("level").notNull(),
  category: text("category"),
  county: text("county").notNull(),
  address: text("address"),
  phone: text("phone"),
  email: text("email"),
  website: text("website"),
  logoUrl: text("logo_url"),
  reportingDateFrom: text("reporting_date_from"),
  reportingDateTo: text("reporting_date_to"),
  admissionRequirements: text("admission_requirements"),
  status: institutionStatusEnum("status").notNull().default("pending"),
  subscriptionStatus: subscriptionStatusEnum("subscription_status").notNull().default("trial"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const feeStructuresTable = pgTable("fee_structures", {
  id: serial("id").primaryKey(),
  institutionId: integer("institution_id").notNull().references(() => institutionsTable.id),
  tuitionFee: text("tuition_fee").notNull().default("0"),
  boardingFee: text("boarding_fee").notNull().default("0"),
  activityFee: text("activity_fee").notNull().default("0"),
  admissionFee: text("admission_fee").notNull().default("0"),
  otherFees: text("other_fees").default("0"),
  notes: text("notes"),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const insertInstitutionSchema = createInsertSchema(institutionsTable).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertInstitution = z.infer<typeof insertInstitutionSchema>;
export type Institution = typeof institutionsTable.$inferSelect;

export const insertFeeStructureSchema = createInsertSchema(feeStructuresTable).omit({ id: true, updatedAt: true });
export type InsertFeeStructure = z.infer<typeof insertFeeStructureSchema>;
export type FeeStructure = typeof feeStructuresTable.$inferSelect;
