import { PrismaClient, PathwayName } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding CBC platform database…");

  // 1. Create demo school
  const school = await prisma.school.upsert({
    where: { code: "NAI001" },
    update: {},
    create: {
      name: "Nairobi Senior School",
      county: "Nairobi",
      code: "NAI001",
    },
  });

  // 2. Create 7 compulsory subjects
  const compulsorySubjectsData = [
    { name: "English",               code: "ENG101" },
    { name: "Kiswahili / KSL",       code: "KIS101" },
    { name: "Community Service Learning", code: "CSL101" },
    { name: "Physical Education",    code: "PE101" },
    { name: "Information and Communication Technology", code: "ICT101" },
    { name: "Religious Education",   code: "RE101" },
    { name: "Indigenous Language",   code: "IND101" },
  ];

  for (const subject of compulsorySubjectsData) {
    await prisma.subject.upsert({
      where: { code: subject.code },
      update: {},
      create: { ...subject, isCompulsory: true },
    });
  }

  // 3. Create STEM pathway and subjects
  const stemPathway = await prisma.pathway.upsert({
    where: { name: PathwayName.STEM },
    update: {},
    create: {
      name: PathwayName.STEM,
      description:
        "Focus on Mathematics, Sciences, and Technology for careers in engineering, medicine, and computing.",
    },
  });

  const stemSubjects = [
    { name: "Mathematics",              code: "STEM_MATH" },
    { name: "Biology",                  code: "STEM_BIO" },
    { name: "Chemistry",                code: "STEM_CHEM" },
    { name: "Physics",                  code: "STEM_PHY" },
    { name: "Computer Science",         code: "STEM_CS" },
    { name: "Agriculture & Nutrition",  code: "STEM_AGRI" },
  ];

  for (const subject of stemSubjects) {
    await prisma.subject.upsert({
      where: { code: subject.code },
      update: {},
      create: { ...subject, isCompulsory: false, pathwayId: stemPathway.id },
    });
  }

  // 4. Create Social Sciences pathway and subjects
  const socialPathway = await prisma.pathway.upsert({
    where: { name: PathwayName.SOCIAL_SCIENCES },
    update: {},
    create: {
      name: PathwayName.SOCIAL_SCIENCES,
      description:
        "Explore History, Geography, Business, and Humanities for careers in law, economics, and public service.",
    },
  });

  const socialSubjects = [
    { name: "History and Government",   code: "SS_HIST" },
    { name: "Geography",                code: "SS_GEO" },
    { name: "Business Studies",         code: "SS_BIZ" },
    { name: "Economics",                code: "SS_ECON" },
    { name: "Sociology",                code: "SS_SOC" },
    { name: "French / German / Mandarin", code: "SS_LANG" },
  ];

  for (const subject of socialSubjects) {
    await prisma.subject.upsert({
      where: { code: subject.code },
      update: {},
      create: { ...subject, isCompulsory: false, pathwayId: socialPathway.id },
    });
  }

  // 5. Create Arts & Sports Science pathway and subjects
  const artsPathway = await prisma.pathway.upsert({
    where: { name: PathwayName.ARTS_AND_SPORTS_SCIENCE },
    update: {},
    create: {
      name: PathwayName.ARTS_AND_SPORTS_SCIENCE,
      description:
        "Develop talent in Visual Arts, Music, Drama, and Sports Science for careers in creative and athletic industries.",
    },
  });

  const artsSubjects = [
    { name: "Visual Arts",             code: "ASS_VART" },
    { name: "Music",                   code: "ASS_MUS" },
    { name: "Drama and Theatre Arts",  code: "ASS_DRAMA" },
    { name: "Sports Science",          code: "ASS_SPORT" },
    { name: "Dance",                   code: "ASS_DANCE" },
    { name: "Media Studies",           code: "ASS_MEDIA" },
  ];

  for (const subject of artsSubjects) {
    await prisma.subject.upsert({
      where: { code: subject.code },
      update: {},
      create: { ...subject, isCompulsory: false, pathwayId: artsPathway.id },
    });
  }

  // 6. Create demo users
  const passwordHash = await bcrypt.hash("Password123!", 12);

  const adminUser = await prisma.user.upsert({
    where: { email: "admin@nairobiss.ac.ke" },
    update: {},
    create: {
      email: "admin@nairobiss.ac.ke",
      passwordHash,
      firstName: "Admin",
      lastName:  "User",
      role:      "ADMIN",
      schoolId:  school.id,
    },
  });

  const teacherUser = await prisma.user.upsert({
    where: { email: "teacher@nairobiss.ac.ke" },
    update: {},
    create: {
      email:     "teacher@nairobiss.ac.ke",
      passwordHash,
      firstName: "Grace",
      lastName:  "Wanjiru",
      role:      "TEACHER",
      schoolId:  school.id,
    },
  });

  const studentUser = await prisma.user.upsert({
    where: { email: "student@nairobiss.ac.ke" },
    update: {},
    create: {
      email:     "student@nairobiss.ac.ke",
      passwordHash,
      firstName: "Brian",
      lastName:  "Otieno",
      role:      "STUDENT",
      grade:     "GRADE_10",
      schoolId:  school.id,
    },
  });

  const compulsorySubjects = await prisma.subject.findMany({
    where: { isCompulsory: true },
    select: { id: true },
  });

  await prisma.studentProfile.upsert({
    where: { userId: studentUser.id },
    update: {},
    create: {
      userId:             studentUser.id,
      compulsoryEnrolled: true,
      electiveSubjectIds: compulsorySubjects.map((s) => s.id),
    },
  });

  const parentUser = await prisma.user.upsert({
    where: { email: "parent@gmail.com" },
    update: {},
    create: {
      email:     "parent@gmail.com",
      passwordHash,
      firstName: "John",
      lastName:  "Otieno",
      role:      "PARENT",
      schoolId:  school.id,
    },
  });

  // Link parent to student
  const existingLink = await prisma.parentChild.findFirst({
    where: { parentId: parentUser.id, childId: studentUser.id },
  });

  if (!existingLink) {
    await prisma.parentChild.create({
      data: { parentId: parentUser.id, childId: studentUser.id },
    });
  }

  console.log("Seed complete!");
  console.log("Demo accounts (password: Password123!):");
  console.log("  Admin:   admin@nairobiss.ac.ke");
  console.log("  Teacher: teacher@nairobiss.ac.ke");
  console.log("  Student: student@nairobiss.ac.ke");
  console.log("  Parent:  parent@gmail.com");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
