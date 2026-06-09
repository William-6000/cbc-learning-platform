export const learnerOverview = {
  fullName: 'Assigned Student',
  gradeLevel: 11,
  pathway: 'STEM',
  attendanceRate: '94%',
  overallCompetency: 'Developing',
};

export const metrics = [
  { title: 'Competencies Assessed', value: '18', subtitle: 'Across Term 2' },
  { title: 'Mastery Level', value: '6', subtitle: 'Competencies at mastery' },
  { title: 'Average Score', value: '78%', subtitle: 'Continuous assessment' },
  { title: 'Pending Tasks', value: '4', subtitle: 'Due this week' },
];

export const pathways = ['STEM', 'Social Sciences', 'Arts & Sports'];

export const roleNavigation = [
  {
    role: 'Students',
    description: 'Track learning progress, assignments, pathways, and feedback.',
    links: [
      { label: 'My Dashboard', href: '/student/dashboard' },
      { label: 'Assignments', href: '/student/assignments' },
      { label: 'Competency Progress', href: '/student/competencies' },
      { label: 'Pathway Explorer', href: '/student/pathways' },
    ],
  },
  {
    role: 'Teachers',
    description: 'Manage classes, assessments, competency evidence, and learner support.',
    links: [
      { label: 'Class Overview', href: '/teacher/classes' },
      { label: 'Assessment Builder', href: '/teacher/assessments' },
      { label: 'Learner Reports', href: '/teacher/reports' },
      { label: 'Feedback Queue', href: '/teacher/feedback' },
    ],
  },
  {
    role: 'Admins',
    description: 'Configure school users, pathways, subjects, and platform settings.',
    links: [
      { label: 'User Management', href: '/admin/users' },
      { label: 'Pathway Setup', href: '/admin/pathways' },
      { label: 'Curriculum Catalog', href: '/admin/curriculum' },
      { label: 'System Settings', href: '/admin/settings' },
    ],
  },
];

export const fallbackDashboardData = {
  learnerOverview,
  metrics,
  pathways,
  roleNavigation,
};
