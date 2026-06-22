import { Response } from "express";
import { prisma } from "../lib/prisma";
import { AuthRequest } from "../middleware/auth";
import { CslStatus } from "@prisma/client";

export async function submitCslLog(
  req: AuthRequest,
  res: Response
): Promise<void> {
  const { title, description, hoursLogged, evidenceUrls } = req.body;

  if (!title || !description || typeof hoursLogged !== "number") {
    res.status(400).json({ error: "title, description, and hoursLogged are required" });
    return;
  }

  if (hoursLogged <= 0 || hoursLogged > 200) {
    res.status(400).json({ error: "hoursLogged must be between 0 and 200" });
    return;
  }

  const log = await prisma.cslLog.create({
    data: {
      studentId: req.user!.id,
      title,
      description,
      hoursLogged,
      evidenceUrls: Array.isArray(evidenceUrls) ? evidenceUrls : [],
      status: "PENDING",
    },
  });

  res.status(201).json({ log });
}

export async function getMyCslLogs(
  req: AuthRequest,
  res: Response
): Promise<void> {
  const logs = await prisma.cslLog.findMany({
    where: { studentId: req.user!.id },
    orderBy: { submittedAt: "desc" },
  });

  const approvedHours = logs
    .filter((l) => l.status === "APPROVED")
    .reduce((sum, l) => sum + l.hoursLogged, 0);

  res.json({ logs, approvedHours });
}

export async function getPendingCslLogs(
  req: AuthRequest,
  res: Response
): Promise<void> {
  const pendingLogs = await prisma.cslLog.findMany({
    where: {
      status: "PENDING",
      student: { schoolId: req.user!.schoolId },
    },
    include: {
      student: {
        select: { id: true, firstName: true, lastName: true, grade: true },
      },
    },
    orderBy: { submittedAt: "asc" },
  });

  res.json({ pendingLogs });
}

export async function reviewCslLog(
  req: AuthRequest,
  res: Response
): Promise<void> {
  const { logId } = req.params;
  const { status, teacherFeedback } = req.body;

  if (!status || !["APPROVED", "REJECTED"].includes(status)) {
    res.status(400).json({ error: "status must be APPROVED or REJECTED" });
    return;
  }

  const log = await prisma.cslLog.findUnique({ where: { id: logId } });
  if (!log) {
    res.status(404).json({ error: "CSL log not found" });
    return;
  }

  if (log.status !== "PENDING") {
    res.status(409).json({ error: "This log has already been reviewed" });
    return;
  }

  const updated = await prisma.cslLog.update({
    where: { id: logId },
    data: {
      status: status as CslStatus,
      teacherFeedback: teacherFeedback || null,
      reviewedById: req.user!.id,
      reviewedAt: new Date(),
    },
  });

  if (status === "APPROVED") {
    await prisma.studentProfile.update({
      where: { userId: log.studentId },
      data: { totalCslHours: { increment: log.hoursLogged } },
    });
  }

  res.json({ updated });
}
