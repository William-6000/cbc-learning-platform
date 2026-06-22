import { Response } from "express";
import { prisma } from "../lib/prisma";
import { AuthRequest } from "../middleware/auth";
import { Competency, RubricScore } from "@prisma/client";

const RUBRIC_WEIGHT: Record<RubricScore, number> = {
  EE: 4,
  ME: 3,
  AE: 2,
  BE: 1,
};

export async function createAssessment(
  req: AuthRequest,
  res: Response
): Promise<void> {
  const { title, description, subjectId, classId, competencyTags, dueDate } =
    req.body;

  if (!title || !subjectId || !classId || !Array.isArray(competencyTags)) {
    res.status(400).json({ error: "title, subjectId, classId, and competencyTags are required" });
    return;
  }

  const validCompetencies = competencyTags.every((c: string) =>
    Object.values(Competency).includes(c as Competency)
  );
  if (!validCompetencies) {
    res.status(400).json({ error: "One or more competency tags are invalid" });
    return;
  }

  const assessment = await prisma.assessment.create({
    data: {
      title,
      description: description || "",
      subjectId,
      classId,
      competencyTags,
      dueDate: dueDate ? new Date(dueDate) : undefined,
    },
    include: { subject: true, class: true },
  });

  res.status(201).json({ assessment });
}

export async function gradeStudent(
  req: AuthRequest,
  res: Response
): Promise<void> {
  const { assessmentId, studentId } = req.params;
  const { score, feedback } = req.body;

  if (!score || !Object.values(RubricScore).includes(score as RubricScore)) {
    res.status(400).json({ error: "score must be one of: EE, ME, AE, BE" });
    return;
  }

  const scoreRecord = await prisma.assessmentScore.upsert({
    where: { assessmentId_studentId: { assessmentId, studentId } },
    update: {
      score: score as RubricScore,
      feedback: feedback || null,
      teacherId: req.user!.id,
      gradedAt: new Date(),
    },
    create: {
      assessmentId,
      studentId,
      score: score as RubricScore,
      feedback: feedback || null,
      teacherId: req.user!.id,
      gradedAt: new Date(),
    },
    include: { student: { select: { firstName: true, lastName: true } } },
  });

  res.json({ scoreRecord });
}

export async function getClassGradebook(
  req: AuthRequest,
  res: Response
): Promise<void> {
  const { classId } = req.params;

  const assessments = await prisma.assessment.findMany({
    where: { classId },
    include: {
      subject: { select: { name: true, code: true } },
      scores: {
        include: {
          student: { select: { id: true, firstName: true, lastName: true } },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  const students = await prisma.classEnrollment.findMany({
    where: { classId, isTeacher: false },
    include: {
      user: { select: { id: true, firstName: true, lastName: true } },
    },
  });

  res.json({
    assessments,
    students: students.map((e) => e.user),
  });
}

export async function getStudentCompetencies(
  req: AuthRequest,
  res: Response
): Promise<void> {
  const scores = await prisma.assessmentScore.findMany({
    where: { studentId: req.user!.id, gradedAt: { not: null } },
    include: {
      assessment: { select: { competencyTags: true } },
    },
  });

  const competencyAggregates: Record<
    string,
    { total: number; count: number }
  > = {};

  Object.values(Competency).forEach((c) => {
    competencyAggregates[c] = { total: 0, count: 0 };
  });

  scores.forEach((scoreRecord) => {
    const weight = RUBRIC_WEIGHT[scoreRecord.score];
    scoreRecord.assessment.competencyTags.forEach((tag) => {
      competencyAggregates[tag].total += weight;
      competencyAggregates[tag].count += 1;
    });
  });

  const competencyScores = Object.entries(competencyAggregates).map(
    ([competency, { total, count }]) => ({
      competency,
      averageWeight: count > 0 ? parseFloat((total / count).toFixed(2)) : 0,
      assessmentsCount: count,
      level:
        count === 0
          ? "NOT_ASSESSED"
          : total / count >= 3.5
          ? "EE"
          : total / count >= 2.5
          ? "ME"
          : total / count >= 1.5
          ? "AE"
          : "BE",
    })
  );

  res.json({ competencyScores });
}

export async function getParentChildProgress(
  req: AuthRequest,
  res: Response
): Promise<void> {
  const { childId } = req.params;

  const link = await prisma.parentChild.findFirst({
    where: { parentId: req.user!.id, childId },
  });

  if (!link) {
    res.status(403).json({ error: "You are not linked to this student" });
    return;
  }

  const scores = await prisma.assessmentScore.findMany({
    where: { studentId: childId },
    include: {
      assessment: {
        include: { subject: { select: { name: true } } },
      },
    },
    orderBy: { gradedAt: "desc" },
    take: 50,
  });

  const cslLogs = await prisma.cslLog.findMany({
    where: { studentId: childId },
    orderBy: { submittedAt: "desc" },
    take: 10,
  });

  const profile = await prisma.studentProfile.findUnique({
    where: { userId: childId },
    include: { pathway: true },
  });

  res.json({ scores, cslLogs, profile });
}
