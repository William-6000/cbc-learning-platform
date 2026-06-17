import { Router } from "express";
import {
  getAllPathways,
  selectPathway,
  getStudentSubjects,
} from "../controllers/pathway.controller";
import { authenticate } from "../middleware/auth";
import { requireRole } from "../middleware/roleGuard";

export const pathwayRoutes = Router();

pathwayRoutes.get("/",                  authenticate, getAllPathways);
pathwayRoutes.post("/select",           authenticate, requireRole("STUDENT"), selectPathway);
pathwayRoutes.get("/my-subjects",       authenticate, requireRole("STUDENT"), getStudentSubjects);
