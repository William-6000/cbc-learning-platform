import { Response } from "express";
import { prisma } from "../lib/prisma";
import { AuthRequest } from "../middleware/auth";

export async function getAllPathways(
  _req: AuthRequest,
  res: Response
): Promise<void> {
  const pathways = await prisma.pathway.findMany({
    include: {
      subjects: {
        where: { isCompulsory: false },
        select: { id: true, name: true, code: true },
      },
    },
  });
  res.json({ pathways });
}

export async function selectPathway(
  req: AuthRequest,
  res: Response
): Promise<void> {
  const { pathwayId, electiveSubjectIds } = req.body;

  if (!pathwayId || !Array.isArray(electiveSubjectIds)) {
    res.status(400).json({ error: "pathwayId and electiveSubjectIds are required" });
    return;
  }

  if (electiveSubjectIds.length < 3 || electiveSubjectIds.length > 4) {
    res.status(400).json({ error: "Students must select 3 to 4 elective subjects" });
    return;
  }

  const pathway = await prisma.pathway.findUnique({ where: { id: pathwayId } });
  if (!pathway) {
    res.status(404).json({ error: "Pathway not found" });
    return;
  }

  const validSubjects = await prisma.subject.findMany({
    where: {
      id: { in: electiveSubjectIds },
      pathwayId: pathwayId,
    },
    select: { id: true },
  });

  if (validSubjects.length !== electiveSubjectIds.length) {
    res.status(400).json({
      error: "One or more elective subjects do not belong to the selected pathway",
    });
    return;
  }

  const compulsorySubjects = await prisma.subject.findMany({
    where: { isCompulsory: true },
    select: { id: true },
  });

  const allEnrolledIds = [
    ...compulsorySubjects.map((s) => s.id),
    ...electiveSubjectIds,
  ];

  const updatedProfile = await prisma.studentProfile.update({
    where: { userId: req.user!.id },
    data: {
      pathwayId,
      electiveSubjectIds,
      compulsoryEnrolled: true,
    },
    include: { pathway: true },
  });

  res.json({
    message: "Pathway and electives selected successfully",
    profile: updatedProfile,
    totalSubjectsEnrolled: allEnrolledIds.length,
  });
}

export async function getStudentSubjects(
  req: AuthRequest,
  res: Response
): Promise<void> {
  const profile = await prisma.studentProfile.findUnique({
    where: { userId: req.user!.id },
    include: { pathway: true },
  });

  if (!profile) {
    res.status(404).json({ error: "Student profile not found" });
    return;
  }

  const compulsorySubjects = await prisma.subject.findMany({
    where: { isCompulsory: true },
    select: { id: true, name: true, code: true },
  });

  const electiveSubjects = await prisma.subject.findMany({
    where: { id: { in: profile.electiveSubjectIds } },
    select: { id: true, name: true, code: true, pathwayId: true },
  });

  res.json({
    pathway: profile.pathway,
    compulsorySubjects,
    electiveSubjects,
    totalCslHours: profile.totalCslHours,
  });
    }
