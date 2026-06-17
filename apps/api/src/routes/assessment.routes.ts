import { Router } from "express";
import {
  createAssessment,
  gradeStudent,
  getClassGradebook,
  getStudentCompetencies,
  getParentChildProgress,
} from "../controllers/assessment.controller";
import { authenticate } from "../middleware/auth";
import { requireRole } from "../middleware/roleGuard";

export const assessmentRoutes = Router();

assessmentRoutes.post("/",
  authenticate, requireRole("TEACHER", "ADMIN"), createAssessment);

assessmentRoutes.post("/:assessmentId/grade/:studentId",
  authenticate, requireRole("TEACHER", "ADMIN"), gradeStudent);

assessmentRoutes.get("/class/:classId/gradebook",
  authenticate, requireRole("TEACHER", "ADMIN"), getClassGradebook);

assessmentRoutes.get("/my-competencies",
  authenticate, requireRole("STUDENT"), getStudentCompetencies);

assessmentRoutes.get("/child/:childId/progress",
  authenticate, requireRole("PARENT"), getParentChildProgress);
