import express from 'express';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import bcrypt from 'bcryptjs';
import { prisma } from './prisma.js';
import { requireAuth, roleGuard, signToken } from './auth.js';

export const app = express();
app.use(cors({ origin: process.env.CLIENT_URL || '*', credentials: true }));
app.use(express.json({ limit: '10mb' }));
app.use(rateLimit({ windowMs: 60_000, limit: 240 }));

const safeUser = { id: true, name: true, email: true, role: true, pathway: true, grade: true, schoolId: true, school: true };
const competencyLabels = {
  COMMUNICATION_COLLABORATION: 'Communication & Collaboration',
  CRITICAL_THINKING_PROBLEM_SOLVING: 'Critical Thinking & Problem Solving',
  CREATIVITY_IMAGINATION: 'Creativity & Imagination',
  CITIZENSHIP: 'Citizenship',
  DIGITAL_LITERACY: 'Digital Literacy',
  LEARNING_TO_LEARN: 'Learning to Learn',
  SELF_EFFICACY: 'Self-Efficacy'
};

app.get('/api/health', (_req, res) => res.json({ status: 'ok', service: 'CBC Senior School API' }));

app.post('/api/auth/register', async (req, res, next) => {
  try {
    const { name, email, password, role = 'STUDENT', pathway, grade, schoolId } = req.body;
    if (!name || !email || !password) return res.status(400).json({ message: 'name, email and password are required' });
    const passwordHash = await bcrypt.hash(password, 12);
    const user = await prisma.user.create({ data: { name, email, passwordHash, role, pathway: role === 'STUDENT' ? pathway : null, grade: grade ? Number(grade) : null, schoolId }, select: safeUser });
    res.status(201).json({ user, token: signToken(user) });
  } catch (error) { next(error); }
});

app.post('/api/auth/login', async (req, res, next) => {
  try {
    const { email, password, role } = req.body;
    const user = await prisma.user.findUnique({ where: { email }, include: { school: true } });
    if (!user || !(await bcrypt.compare(password, user.passwordHash)) || (role && user.role !== role)) return res.status(401).json({ message: 'Invalid credentials or role' });
    const { passwordHash, ...withoutPassword } = user;
    res.json({ user: withoutPassword, token: signToken(user) });
  } catch (error) { next(error); }
});

app.get('/api/schools', async (_req, res, next) => {
  try { res.json(await prisma.school.findMany({ orderBy: { name: 'asc' } })); } catch (error) { next(error); }
});

app.get('/api/pathways', async (_req, res, next) => {
  try { res.json(await prisma.pathway.findMany({ include: { subjects: { select: { id: true, name: true, gradeLevel: true } } }, orderBy: { name: 'asc' } })); } catch (error) { next(error); }
});

app.get('/api/subjects', async (req, res, next) => {
  try {
    const { pathway, grade } = req.query;
    const where = { ...(grade ? { gradeLevel: Number(grade) } : {}), ...(pathway ? { pathway: { code: pathway } } : {}) };
    res.json(await prisma.subject.findMany({ where, include: { pathway: true, units: { include: { lessons: true } }, assessments: true }, orderBy: [{ gradeLevel: 'asc' }, { name: 'asc' }] }));
  } catch (error) { next(error); }
});

app.get('/api/subjects/:id', async (req, res, next) => {
  try {
    const subject = await prisma.subject.findUnique({ where: { id: req.params.id }, include: { pathway: true, teachers: { select: safeUser }, units: { orderBy: { sequenceNumber: 'asc' }, include: { lessons: true } }, assessments: true } });
    if (!subject) return res.status(404).json({ message: 'Subject not found' });
    res.json(subject);
  } catch (error) { next(error); }
});

app.get('/api/subjects/:id/units', async (req, res, next) => {
  try { res.json(await prisma.unit.findMany({ where: { subjectId: req.params.id }, include: { lessons: true, teacherNotes: true }, orderBy: { sequenceNumber: 'asc' } })); } catch (error) { next(error); }
});

app.get('/api/units/:id/lessons', async (req, res, next) => {
  try { res.json(await prisma.lesson.findMany({ where: { unitId: req.params.id }, orderBy: { title: 'asc' } })); } catch (error) { next(error); }
});

app.get('/api/lessons/:id', async (req, res, next) => {
  try {
    const lesson = await prisma.lesson.findUnique({ where: { id: req.params.id }, include: { unit: { include: { subject: { include: { pathway: true } } } } } });
    if (!lesson) return res.status(404).json({ message: 'Lesson not found' });
    res.json(lesson);
  } catch (error) { next(error); }
});

app.post('/api/lessons/:id/complete', requireAuth, async (req, res, next) => {
  try {
    const { score, timeSpentMins = 0, personalNotes = '' } = req.body;
    const progress = await prisma.studentProgress.upsert({ where: { studentId_lessonId: { studentId: req.user.id, lessonId: req.params.id } }, create: { studentId: req.user.id, lessonId: req.params.id, completedAt: new Date(), score, timeSpentMins, personalNotes }, update: { completedAt: new Date(), score, timeSpentMins, personalNotes } });
    res.json(progress);
  } catch (error) { next(error); }
});

app.get('/api/assessments/:id', async (req, res, next) => {
  try {
    const assessment = await prisma.assessment.findUnique({ where: { id: req.params.id }, include: { subject: true, questions: true } });
    if (!assessment) return res.status(404).json({ message: 'Assessment not found' });
    res.json(assessment);
  } catch (error) { next(error); }
});

app.post('/api/assessments/:id/submit', requireAuth, async (req, res, next) => {
  try {
    const assessment = await prisma.assessment.findUnique({ where: { id: req.params.id }, include: { questions: true } });
    if (!assessment) return res.status(404).json({ message: 'Assessment not found' });
    const answers = req.body.answers || {};
    let marks = 0;
    let needsReview = assessment.type !== 'formative';
    const feedback = assessment.questions.map((question) => {
      const answer = answers[question.id] ?? '';
      const correct = question.type === 'MCQ' && String(answer).trim().toLowerCase() === String(question.correctAnswer || '').trim().toLowerCase();
      if (question.type === 'MCQ' && correct) marks += question.marks;
      if (question.type !== 'MCQ') needsReview = true;
      return { questionId: question.id, correct, correctAnswer: question.correctAnswer, explanation: question.explanation };
    });
    const grade = await prisma.grade.upsert({ where: { studentId_assessmentId: { studentId: req.user.id, assessmentId: assessment.id } }, create: { studentId: req.user.id, assessmentId: assessment.id, marksObtained: marks, gradedAt: needsReview ? null : new Date(), submission: { answers, feedback }, needsReview, teacherRemarks: needsReview ? 'Submitted for teacher review.' : 'Auto-graded MCQ submission.' }, update: { marksObtained: marks, gradedAt: needsReview ? null : new Date(), submission: { answers, feedback }, needsReview } });
    res.json({ grade, feedback, scorePercent: Math.round((marks / assessment.totalMarks) * 100) });
  } catch (error) { next(error); }
});

app.get('/api/students/:id/progress', requireAuth, async (req, res, next) => {
  try {
    const [progress, competencies, subjects] = await Promise.all([
      prisma.studentProgress.findMany({ where: { studentId: req.params.id }, include: { lesson: { include: { unit: { include: { subject: true } } } } } }),
      prisma.studentCompetency.findMany({ where: { studentId: req.params.id } }),
      prisma.subject.findMany({ where: { gradeLevel: 10 }, include: { units: { include: { lessons: true } }, assessments: { include: { grades: { where: { studentId: req.params.id } } } } } })
    ]);
    const bySubject = subjects.map((subject) => {
      const lessons = subject.units.flatMap((unit) => unit.lessons);
      const completed = progress.filter((item) => lessons.some((lesson) => lesson.id === item.lessonId) && item.completedAt).length;
      return { subjectId: subject.id, subject: subject.name, completed, total: lessons.length, percent: lessons.length ? Math.round((completed / lessons.length) * 100) : 0 };
    });
    res.json({ progress, bySubject, competencies: competencies.map((c) => ({ ...c, label: competencyLabels[c.competency] })) });
  } catch (error) { next(error); }
});

app.get('/api/students/:id/grades', requireAuth, async (req, res, next) => {
  try {
    const grades = await prisma.grade.findMany({ where: { studentId: req.params.id }, include: { assessment: { include: { subject: true } } }, orderBy: { gradedAt: 'desc' } });
    const formative = grades.filter((g) => g.assessment.type === 'formative');
    const summative = grades.filter((g) => g.assessment.type === 'summative' || g.assessment.type === 'project');
    const avg = (items) => items.length ? items.reduce((sum, g) => sum + (g.marksObtained / g.assessment.totalMarks) * 100, 0) / items.length : 0;
    res.json({ grades, weightedScore: Math.round(avg(formative) * 0.4 + avg(summative) * 0.6) });
  } catch (error) { next(error); }
});

app.put('/api/grades/:id', requireAuth, roleGuard('TEACHER', 'ADMIN'), async (req, res, next) => {
  try { res.json(await prisma.grade.update({ where: { id: req.params.id }, data: { marksObtained: Number(req.body.marksObtained), teacherRemarks: req.body.teacherRemarks, gradedAt: new Date(), needsReview: false } })); } catch (error) { next(error); }
});

app.post('/api/announcements', requireAuth, roleGuard('TEACHER', 'ADMIN'), async (req, res, next) => {
  try { res.status(201).json(await prisma.announcement.create({ data: { schoolId: req.body.schoolId || req.user.schoolId, authorId: req.user.id, title: req.body.title, body: req.body.body, pathway: req.body.pathway || null } })); } catch (error) { next(error); }
});

app.get('/api/analytics/overview', requireAuth, roleGuard('ADMIN'), async (_req, res, next) => {
  try {
    const [students, subjects, grades, progress] = await Promise.all([
      prisma.user.groupBy({ by: ['pathway'], where: { role: 'STUDENT' }, _count: true }),
      prisma.subject.findMany({ include: { pathway: true } }),
      prisma.grade.findMany({ include: { assessment: { include: { subject: true } }, student: { include: { school: true } } } }),
      prisma.studentProgress.findMany()
    ]);
    const averageGrades = subjects.map((subject) => {
      const rows = grades.filter((grade) => grade.assessment.subjectId === subject.id);
      return { subject: subject.name, average: rows.length ? Math.round(rows.reduce((sum, grade) => sum + (grade.marksObtained / grade.assessment.totalMarks) * 100, 0) / rows.length) : 0 };
    });
    res.json({ pathwayDistribution: students, averageGrades, usageHeatmap: progress.map((p) => ({ day: new Date(p.completedAt || Date.now()).getDay(), hour: new Date(p.completedAt || Date.now()).getHours(), minutes: p.timeSpentMins })) });
  } catch (error) { next(error); }
});

app.post('/api/messages', requireAuth, async (req, res, next) => {
  try { res.status(201).json(await prisma.message.create({ data: { senderId: req.user.id, receiverId: req.body.receiverId, subject: req.body.subject, body: req.body.body } })); } catch (error) { next(error); }
});

app.get('/api/messages/:userId', requireAuth, async (req, res, next) => {
  try { res.json(await prisma.message.findMany({ where: { OR: [{ senderId: req.params.userId }, { receiverId: req.params.userId }] }, include: { sender: { select: safeUser }, receiver: { select: safeUser } }, orderBy: { createdAt: 'desc' } })); } catch (error) { next(error); }
});

app.use((error, _req, res, _next) => {
  console.error(error);
  if (error.code === 'P2002') return res.status(409).json({ message: 'A record with this unique value already exists' });
  res.status(500).json({ message: 'Server error', detail: process.env.NODE_ENV === 'production' ? undefined : error.message });
});
                                                                                    
