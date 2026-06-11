const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({
  origin: process.env.FRONTEND_URL || '*'
}));
app.use(express.json());

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'cbc-learning-platform-backend',
    frontendOrigin: process.env.FRONTEND_URL
  });
});

// Dashboard
app.get('/api/dashboard', (req, res) => {
  res.json({
    learnerOverview: {
      fullName: 'Assigned Student',
      gradeLevel: 11,
      pathway: 'STEM',
      attendanceRate: '94%',
      overallCompetency: 'Developing'
    },
    metrics: [
      { title: 'Competencies Assessed', value: '18', subtitle: 'Across Term 2' },
      { title: 'Mastery Level', value: '6', subtitle: 'Competencies at mastery' },
      { title: 'Average Score', value: '78%', subtitle: 'Continuous assessment' },
      { title: 'Pending Tasks', value: '4', subtitle: 'Due this week' }
    ],
    pathways: ['STEM', 'Social Sciences', 'Arts & Sports'],
    roleNavigation: [
      {
        role: 'Students',
        description: 'Track learning progress',
        links: [
          { label: 'My Dashboard', href: '/student/dashboard' },
          { label: 'Assignments', href: '/student/assignments' },
          { label: 'Competency Progress', href: '/student/competencies' },
          { label: 'Pathway Explorer', href: '/student/pathways' }
        ]
      },
      {
        role: 'Teachers',
        description: 'Manage classes and assessments',
        links: [
          { label: 'Class Overview', href: '/teacher/classes' },
          { label: 'Assessment Builder', href: '/teacher/assessments' },
          { label: 'Learner Reports', href: '/teacher/reports' },
          { label: 'Feedback Queue', href: '/teacher/feedback' }
        ]
      },
      {
        role: 'Admins',
        description: 'Configure school settings',
        links: [
          { label: 'User Management', href: '/admin/users' },
          { label: 'Pathway Setup', href: '/admin/pathways' },
          { label: 'Curriculum Catalog', href: '/admin/curriculum' },
          { label: 'System Settings', href: '/admin/settings' }
        ]
      }
    ]
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
