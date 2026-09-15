import { Router } from "express";
import healthRouter from "./health";
import usersRouter from "./users";
import institutionsRouter from "./institutions";
import applicationsRouter from "./applications";
import studentsRouter from "./students";
import documentsRouter from "./documents";
import inventoryRouter from "./inventory";
import paymentsRouter from "./payments";
import allocationsRouter from "./allocations";
import classesRouter from "./classes";
import dormitoriesRouter from "./dormitories";
import notificationsRouter from "./notifications";
import dashboardRouter from "./dashboard";
import auditLogsRouter from "./auditlogs";

const router = Router();

router.use(healthRouter);
router.use(usersRouter);
router.use(institutionsRouter);
router.use(applicationsRouter);
router.use(studentsRouter);
router.use(documentsRouter);
router.use(inventoryRouter);
router.use(paymentsRouter);
router.use(allocationsRouter);
router.use(classesRouter);
router.use(dormitoriesRouter);
router.use(notificationsRouter);
router.use(dashboardRouter);
router.use(auditLogsRouter);

export default router;
