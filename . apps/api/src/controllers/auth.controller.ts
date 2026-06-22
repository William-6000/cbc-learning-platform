import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { prisma } from "../lib/prisma";
import { AuthRequest } from "../middleware/auth";

const COMPULSORY_SUBJECT_CODES = [
  "ENG101", "KIS101", "CSL101", "PE101", "ICT101", "RE101", "IND101",
];

export async function register(req: Request, res: Response): Promise<void> {
  const { email, password, firstName, lastName, role, grade, schoolId } = req.body;

  if (!email || !password || !firstName || !lastName || !role || !schoolId) {
    res.status(400).json({ error: "All fields are required" });
    return;
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    res.status(409).json({ error: "Email already registered" });
    return;
  }

  const passwordHash = await bcrypt.hash(password, 12);

  const user = await prisma.user.create({
    data: {
      email,
      passwordHash,
      firstName,
      lastName,
      role,
      grade: role === "STUDENT" ? grade : undefined,
      schoolId,
    },
  });

  if (role === "STUDENT") {
    const compulsorySubjects = await prisma.subject.findMany({
      where: { code: { in: COMPULSORY_SUBJECT_CODES } },
      select: { id: true },
    });

    await prisma.studentProfile.create({
      data: {
        userId: user.id,
        compulsoryEnrolled: true,
        electiveSubjectIds: compulsorySubjects.map((s) => s.id),
      },
    });
  }

  const token = jwt.sign(
    { id: user.id, role: user.role, schoolId: user.schoolId },
    process.env.JWT_SECRET as string,
    { expiresIn: "7d" }
  );

  res.cookie("token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  res.status(201).json({
    user: {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      grade: user.grade,
    },
  });
}

export async function login(req: Request, res: Response): Promise<void> {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400).json({ error: "Email and password are required" });
    return;
  }

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    res.status(401).json({ error: "Invalid credentials" });
    return;
  }

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) {
    res.status(401).json({ error: "Invalid credentials" });
    return;
  }

  const token = jwt.sign(
    { id: user.id, role: user.role, schoolId: user.schoolId },
    process.env.JWT_SECRET as string,
    { expiresIn: "7d" }
  );

  res.cookie("token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  res.json({
    user: {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      grade: user.grade,
    },
  });
}

export async function logout(_req: Request, res: Response): Promise<void> {
  res.clearCookie("token");
  res.json({ message: "Logged out successfully" });
}

export async function getMe(req: AuthRequest, res: Response): Promise<void> {
  const user = await prisma.user.findUnique({
    where: { id: req.user!.id },
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      role: true,
      grade: true,
      studentProfile: {
        include: {
          pathway: true,
        },
      },
    },
  });

  if (!user) {
    res.status(404).json({ error: "User not found" });
    return;
  }

  res.json({ user });
        }
