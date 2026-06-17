import { Router } from "express";
import {
  submitCslLog,
  getMyCslLogs,
  getPendingCslLogs,
  reviewCslLog,
} from "../controllers/csl.controller";
import { authenticate } from "../middleware/auth";
import { requireRole } from "../middleware/roleGuard";

export const cslRoutes = Router();

cslRoutes.post("/submit",         authenticate, requireRole("STUDENT"),         submitCslLog);
cslRoutes.get("/my-logs",         authenticate, requireRole("STUDENT"),         getMyCslLogs);
cslRoutes.get("/pending",         authenticate, requireRole("TEACHER", "ADMIN"), getPendingCslLogs);
cslRoutes.patch("/:logId/review", authenticate, requireRole("TEACHER", "ADMIN"), reviewCslLog);
