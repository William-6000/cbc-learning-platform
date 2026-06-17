export type Role = "STUDENT" | "TEACHER" | "PARENT" | "ADMIN";
export type Grade = "GRADE_10" | "GRADE_11" | "GRADE_12";
export type PathwayName = "STEM" | "SOCIAL_SCIENCES" | "ARTS_AND_SPORTS_SCIENCE";
export type RubricScore = "EE" | "ME" | "AE" | "BE";
export type CslStatus = "PENDING" | "APPROVED" | "REJECTED";
export type Competency =
  | "COMMUNICATION"
  | "CRITICAL_THINKING"
  | "CREATIVITY"
  | "CITIZENSHIP"
  | "DIGITAL_LITERACY"
  | "LEARNING_TO_LEARN"
  | "SELF_EFFICACY";

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: Role;
  grade?: Grade;
  studentProfile?: StudentProfile;
}

export interface StudentProfile {
  id: string;
  pathwayId?: string;
  pathway?: Pathway;
  electiveSubjectIds: string[];
  compulsoryEnrolled: boolean;
  totalCslHours: number;
}

export interface Pathway {
  id: string;
  name: PathwayName;
  description: string;
  subjects: Subject[];
}

export interface Subject {
  id: string;
  name: string;
  code: string;
  isCompulsory: boolean;
}

export interface Assessment {
  id: string;
  title: string;
  description: string;
  subject: Subject;
  competencyTags: Competency[];
  dueDate?: string;
  scores?: AssessmentScore[];
}

export interface AssessmentScore {
  id: string;
  score: RubricScore;
  feedback?: string;
  gradedAt?: string;
  student?: Pick<User, "id" | "firstName" | "lastName">;
}

export interface CompetencyScore {
  competency: Competency;
  averageWeight: number;
  assessmentsCount: number;
  level: RubricScore | "NOT_ASSESSED";
}

export interface CslLog {
  id: string;
  title: string;
  description: string;
  hoursLogged: number;
  evidenceUrls: string[];
  status: CslStatus;
  teacherFeedback?: string;
  submittedAt: string;
  reviewedAt?: string;
  student?: Pick<User, "id" | "firstName" | "lastName" | "grade">;
}
