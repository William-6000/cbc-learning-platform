import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { prisma } from "../lib/prisma";

export interface AuthRequest extends Request {
  user?: { id: string; role: string; schoolId: string };
}

export async function authenticate(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  const token =
    req.cookies?.token ||
    req.headers.authorization?.replace("Bearer ", "");

  if (!token) {
    res.status(401).json({ error: "Authentication required" });
    return;
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as {
      id: string;
      role: string;
      schoolId: string;
    };

    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: { id: true, role: true, schoolId: true },
    });

    if (!user) {
      res.status(401).json({ error: "User not found" });
      return;
    }

    req.user = { id: user.id, role: user.role, schoolId: user.schoolId };
    next();
  } catch {
    res.status(401).json({ error: "Invalid or expired token" });
  }
}
