import { Router, type IRouter } from "express";
import { eq, ilike } from "drizzle-orm";
import { db, studentsTable, guardiansTable, medicalRecordsTable, applicationsTable } from "@workspace/db";
import { requireAuth, type AuthRequest } from "../middlewares/auth";

const router: IRouter = Router();

router.get("/students", requireAuth, async (req: AuthRequest, res): Promise<void> => {
  const { institutionId, search } = req.query as Record<string, string>;
  let students = await db.select().from(studentsTable).orderBy(studentsTable.fullName);
  if (search) students = students.filter(s => s.fullName.toLowerCase().includes(search.toLowerCase()) || (s.assessmentNumber ?? "").includes(search) || (s.admissionNumber ?? "").includes(search));
  res.json(students);
});

router.post("/students", requireAuth, async (req: AuthRequest, res): Promise<void> => {
  const { applicationId, fullName, gender, dateOfBirth, assessmentNumber, admissionNumber, religion, county, homeAddress, previousSchool, passportPhotoUrl } = req.body;
  if (!applicationId || !fullName || !gender) { res.status(400).json({ error: "applicationId, fullName, gender required" }); return; }
  const existing = await db.select().from(studentsTable).where(eq(studentsTable.applicationId, applicationId));
  if (existing.length > 0) {
    const [s] = await db.update(studentsTable).set({ fullName, gender, dateOfBirth, assessmentNumber, admissionNumber, religion, county, homeAddress, previousSchool, passportPhotoUrl }).where(eq(studentsTable.applicationId, applicationId)).returning();
    res.json(s);
    return;
  }
  const [s] = await db.insert(studentsTable).values({ applicationId, fullName, gender, dateOfBirth, assessmentNumber, admissionNumber, religion, county, homeAddress, previousSchool, passportPhotoUrl }).returning();
  res.status(201).json(s);
});

router.get("/students/:id", requireAuth, async (req: AuthRequest, res): Promise<void> => {
  const id = parseInt(req.params.id as string, 10);
  const [s] = await db.select().from(studentsTable).where(eq(studentsTable.id, id));
  if (!s) { res.status(404).json({ error: "Not found" }); return; }
  res.json(s);
});

router.patch("/students/:id", requireAuth, async (req: AuthRequest, res): Promise<void> => {
  const id = parseInt(req.params.id as string, 10);
  const { fullName, gender, dateOfBirth, religion, county, homeAddress, previousSchool, passportPhotoUrl, admissionNumber } = req.body;
  const [s] = await db.update(studentsTable).set({ fullName, gender, dateOfBirth, religion, county, homeAddress, previousSchool, passportPhotoUrl, admissionNumber }).where(eq(studentsTable.id, id)).returning();
  if (!s) { res.status(404).json({ error: "Not found" }); return; }
  res.json(s);
});

router.get("/students/:id/guardian", requireAuth, async (req: AuthRequest, res): Promise<void> => {
  const id = parseInt(req.params.id as string, 10);
  const [g] = await db.select().from(guardiansTable).where(eq(guardiansTable.studentId, id));
  if (!g) { res.status(404).json({ error: "Not found" }); return; }
  res.json(g);
});

router.put("/students/:id/guardian", requireAuth, async (req: AuthRequest, res): Promise<void> => {
  const id = parseInt(req.params.id as string, 10);
  const { parentName, relationship, phone, email, occupation, residentialAddress, emergencyContact } = req.body;
  const existing = await db.select().from(guardiansTable).where(eq(guardiansTable.studentId, id));
  let g;
  if (existing.length > 0) {
    [g] = await db.update(guardiansTable).set({ parentName, relationship, phone, email, occupation, residentialAddress, emergencyContact }).where(eq(guardiansTable.studentId, id)).returning();
  } else {
    [g] = await db.insert(guardiansTable).values({ studentId: id, parentName, relationship, phone, email, occupation, residentialAddress, emergencyContact }).returning();
  }
  res.json(g);
});

router.put("/students/:id/medical", requireAuth, async (req: AuthRequest, res): Promise<void> => {
  const id = parseInt(req.params.id as string, 10);
  const { height, weight, vision, allergies, medicalConditions } = req.body;
  const existing = await db.select().from(medicalRecordsTable).where(eq(medicalRecordsTable.studentId, id));
  let m;
  if (existing.length > 0) {
    [m] = await db.update(medicalRecordsTable).set({ height: height ? String(height) : undefined, weight: weight ? String(weight) : undefined, vision, allergies, medicalConditions }).where(eq(medicalRecordsTable.studentId, id)).returning();
  } else {
    [m] = await db.insert(medicalRecordsTable).values({ studentId: id, height: height ? String(height) : undefined, weight: weight ? String(weight) : undefined, vision, allergies, medicalConditions }).returning();
  }
  res.json({ ...m, height: m.height ? parseFloat(m.height) : null, weight: m.weight ? parseFloat(m.weight) : null });
});

export default router;
