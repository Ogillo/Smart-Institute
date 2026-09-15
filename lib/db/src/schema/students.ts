import { pgTable, text, serial, timestamp, integer, numeric, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { applicationsTable } from "./applications";

export const genderEnum = pgEnum("gender", ["male", "female", "other"]);

export const studentsTable = pgTable("students", {
  id: serial("id").primaryKey(),
  applicationId: integer("application_id").notNull().references(() => applicationsTable.id).unique(),
  fullName: text("full_name").notNull(),
  gender: genderEnum("gender").notNull(),
  dateOfBirth: text("date_of_birth"),
  assessmentNumber: text("assessment_number"),
  admissionNumber: text("admission_number"),
  religion: text("religion"),
  county: text("county"),
  homeAddress: text("home_address"),
  previousSchool: text("previous_school"),
  passportPhotoUrl: text("passport_photo_url"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const guardiansTable = pgTable("guardians", {
  id: serial("id").primaryKey(),
  studentId: integer("student_id").notNull().references(() => studentsTable.id).unique(),
  parentName: text("parent_name").notNull(),
  relationship: text("relationship").notNull(),
  phone: text("phone").notNull(),
  email: text("email"),
  occupation: text("occupation"),
  residentialAddress: text("residential_address"),
  emergencyContact: text("emergency_contact"),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const medicalRecordsTable = pgTable("medical_records", {
  id: serial("id").primaryKey(),
  studentId: integer("student_id").notNull().references(() => studentsTable.id).unique(),
  height: numeric("height"),
  weight: numeric("weight"),
  vision: text("vision"),
  allergies: text("allergies"),
  medicalConditions: text("medical_conditions"),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const insertStudentSchema = createInsertSchema(studentsTable).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertStudent = z.infer<typeof insertStudentSchema>;
export type Student = typeof studentsTable.$inferSelect;
