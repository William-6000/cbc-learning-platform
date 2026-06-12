import 'dotenv/config';
import bcrypt from 'bcryptjs';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const grades = [10, 11, 12];
const pathways = [
  { code: 'STEM', name: 'STEM Pathway', description: 'Sciences, mathematics, computer science, agriculture and applied technical studies.', careerOutcomes: ['Engineer', 'Doctor', 'Data Scientist', 'Agronomist', 'Architectural Technologist'], kuccpsCourses: ['BSc Computer Science', 'Bachelor of Medicine', 'BSc Agricultural Education', 'BSc Civil Engineering'], tvetOptions: ['Diploma in Building Technology', 'Diploma in ICT', 'Diploma in Electrical Engineering'] },
  { code: 'SOCIAL_SCIENCES', name: 'Social Sciences Pathway', description: 'Humanities, languages, business and civic leadership for local and global participation.', careerOutcomes: ['Lawyer', 'Teacher', 'Economist', 'Diplomat', 'Entrepreneur'], kuccpsCourses: ['Bachelor of Education Arts', 'BA International Relations', 'Bachelor of Commerce', 'BA Economics'], tvetOptions: ['Diploma in Business Management', 'Diploma in Social Work', 'Diploma in Languages'] },
  { code: 'ARTS_AND_SPORTS', name: 'Arts & Sports Pathway', description: 'Creative arts, performing arts, home science, aviation, maritime and sports excellence.', careerOutcomes: ['Creative Director', 'Musician', 'Sports Scientist', 'Pilot', 'Maritime Officer'], kuccpsCourses: ['Bachelor of Music', 'BA Theatre Arts', 'BSc Sports Science', 'Bachelor of Arts Design'], tvetOptions: ['Diploma in Fashion Design', 'Diploma in Music Production', 'Diploma in Sports Coaching'] }
];
const subjectMap = {
  STEM: ['Mathematics', 'Biology', 'Chemistry', 'Physics', 'Computer Science', 'Agriculture', 'Technical Drawing', 'Building & Construction'],
  SOCIAL_SCIENCES: ['History & Citizenship', 'Geography', 'Religious Education', 'Business Studies', 'Economics', 'French', 'German', 'Arabic', 'Kiswahili', 'English', 'Fasihi ya Kiswahili'],
  ARTS_AND_SPORTS: ['Visual Arts', 'Music', 'Drama & Theatre', 'Home Science', 'Aviation', 'Maritime', 'Physical Education & Sports']
};
const competencies = ['COMMUNICATION_COLLABORATION', 'CRITICAL_THINKING_PROBLEM_SOLVING', 'CREATIVITY_IMAGINATION', 'CITIZENSHIP', 'DIGITAL_LITERACY', 'LEARNING_TO_LEARN', 'SELF_EFFICACY'];
const samplePassword = await bcrypt.hash('Password123!', 12);

function codeFor(name, grade) {
  return `KICD-SS-${grade}-${name.toUpperCase().replace(/[^A-Z]+/g, '-').replace(/^-|-$/g, '').slice(0, 20)}`;
}

async function main() {
  const school = await prisma.school.upsert({ where: { id: 'school-nairobi-demo' }, update: {}, create: { id: 'school-nairobi-demo', name: 'Nairobi CBC Senior School', county: 'Nairobi', type: 'PUBLIC' } });
  for (const pathway of pathways) await prisma.pathway.upsert({ where: { code: pathway.code }, update: pathway, create: pathway });
  const pathwayRows = Object.fromEntries((await prisma.pathway.findMany()).map((p) => [p.code, p]));

  for (const [pathwayCode, subjects] of Object.entries(subjectMap)) {
    for (const grade of grades) {
      for (const name of subjects) {
        const subject = await prisma.subject.upsert({
          where: { name_gradeLevel: { name, gradeLevel: grade } },
          update: {},
          create: { name, gradeLevel: grade, pathwayId: pathwayRows[pathwayCode].id, syllabusCode: codeFor(name, grade), overview: `${name} Grade ${grade} follows the CBC senior school design with inquiry, projects, values integration and pathway career links.`, resources: [{ title: 'KICD syllabus overview', url: 'https://kicd.ac.ke/' }, { title: 'Teacher notes pack', url: 'https://res.cloudinary.com/demo/cbc-notes.pdf' }] }
        });
        for (let seq = 1; seq <= 2; seq++) {
          const unit = await prisma.unit.upsert({
            where: { subjectId_sequenceNumber: { subjectId: subject.id, sequenceNumber: seq } },
            update: {},
            create: { subjectId: subject.id, title: `${name} Core Inquiry ${seq}`, sequenceNumber: seq, learningOutcomes: [`Apply ${name} concepts to Kenyan community contexts`, 'Collaborate to solve authentic CBC tasks', 'Communicate findings using bilingual academic language'], projectBrief: `Design a community-based ${name.toLowerCase()} project and present evidence in a learner portfolio.`, rubric: [{ criterion: 'Inquiry', marks: 10 }, { criterion: 'Creativity', marks: 10 }, { criterion: 'Values and PPI link', marks: 10 }], values: ['UNITY', 'INTEGRITY', 'SUSTAINABILITY'], ppiLinks: ['Climate action', 'Financial literacy', 'Digital citizenship'] }
          });
          const lessonTypes = ['video', 'pdf', 'quiz'];
          for (let index = 0; index < lessonTypes.length; index++) {
            await prisma.lesson.upsert({
              where: { id: `${subject.id}-u${seq}-l${index + 1}` },
              update: {},
              create: { id: `${subject.id}-u${seq}-l${index + 1}`, unitId: unit.id, title: `${name} Lesson ${seq}.${index + 1}`, contentType: lessonTypes[index], contentUrl: lessonTypes[index] === 'video' ? 'https://www.youtube.com/embed/dQw4w9WgXcQ' : 'https://res.cloudinary.com/demo/cbc-resource.pdf', durationMins: 35 + index * 10, notesPrompt: 'What new competency evidence did you create today?' }
            });
          }
        }
        for (const type of ['formative', 'summative', 'project']) {
          const assessment = await prisma.assessment.upsert({ where: { id: `${subject.id}-${type}` }, update: {}, create: { id: `${subject.id}-${type}`, subjectId: subject.id, title: `${name} ${type} assessment`, type, totalMarks: type === 'project' ? 30 : 20, dueDate: new Date(Date.now() + (type === 'formative' ? 7 : 21) * 86400000), durationMins: type === 'summative' ? 90 : 45 } });
          await prisma.question.upsert({ where: { id: `${assessment.id}-q1` }, update: {}, create: { id: `${assessment.id}-q1`, assessmentId: assessment.id, text: `Which practice best demonstrates CBC learning in ${name}?`, type: 'MCQ', marks: 5, options: ['Memorising only', 'Project evidence and reflection', 'Ignoring feedback', 'Copying notes'], correctAnswer: 'Project evidence and reflection', explanation: 'CBC emphasises authentic competency evidence and reflection.' } });
          await prisma.question.upsert({ where: { id: `${assessment.id}-q2` }, update: {}, create: { id: `${assessment.id}-q2`, assessmentId: assessment.id, text: `Explain how ${name} supports unity, integrity or sustainability in Kenya.`, type: type === 'formative' ? 'structured' : 'essay', marks: type === 'project' ? 25 : 15, options: [], correctAnswer: null, explanation: 'Teacher reviews structured and essay evidence against the rubric.' } });
        }
      }
    }
  }

  await prisma.user.upsert({ where: { email: 'admin@cbc.ke' }, update: {}, create: { name: 'Amina Admin', email: 'admin@cbc.ke', passwordHash: samplePassword, role: 'ADMIN', schoolId: school.id } });
  for (const pathwayCode of Object.keys(subjectMap)) {
    const firstSubjects = await prisma.subject.findMany({ where: { pathway: { code: pathwayCode }, gradeLevel: 10 }, take: 4 });
    for (let i = 1; i <= 2; i++) {
      const teacher = await prisma.user.upsert({ where: { email: `${pathwayCode.toLowerCase()}teacher${i}@cbc.ke` }, update: {}, create: { name: `${pathwayCode.replaceAll('_', ' ')} Teacher ${i}`, email: `${pathwayCode.toLowerCase()}teacher${i}@cbc.ke`, passwordHash: samplePassword, role: 'TEACHER', pathway: pathwayCode, schoolId: school.id, taughtSubjects: { connect: firstSubjects.slice((i - 1) * 2, i * 2).map((s) => ({ id: s.id })) } } });
      await prisma.teacherNote.create({ data: { teacherId: teacher.id, subjectId: firstSubjects[0].id, title: `${pathwayCode} CBC facilitation guide`, fileUrl: 'https://res.cloudinary.com/demo/teacher-note.pdf' } }).catch(() => null);
    }
    for (let i = 1; i <= 3; i++) {
      const student = await prisma.user.upsert({ where: { email: `${pathwayCode.toLowerCase()}student${i}@cbc.ke` }, update: {}, create: { name: `${pathwayCode.replaceAll('_', ' ')} Student ${i}`, email: `${pathwayCode.toLowerCase()}student${i}@cbc.ke`, passwordHash: samplePassword, role: 'STUDENT', pathway: pathwayCode, grade: 10, schoolId: school.id } });
      for (const competency of competencies) await prisma.studentCompetency.upsert({ where: { studentId_competency: { studentId: student.id, competency } }, update: {}, create: { studentId: student.id, competency, score: 55 + Math.floor(Math.random() * 35), evidence: 'Seeded portfolio evidence from projects, quizzes and reflections.' } });
      const lessons = await prisma.lesson.findMany({ where: { unit: { subject: { pathway: { code: pathwayCode }, gradeLevel: 10 } } }, take: 5 });
      for (const lesson of lessons.slice(0, i + 1)) await prisma.studentProgress.upsert({ where: { studentId_lessonId: { studentId: student.id, lessonId: lesson.id } }, update: {}, create: { studentId: student.id, lessonId: lesson.id, completedAt: new Date(), score: 70 + i, timeSpentMins: 32 } });
    }
  }
  console.log('CBC Senior School seed data loaded. Login with admin@cbc.ke / Password123!');
}

main().finally(async () => prisma.$disconnect());
                   
