import http from 'node:http';
import mongoose from 'mongoose';

import { handleAuthRoutes } from './routes/auth.js';

const port = process.env.PORT || 4000;
const allowedOrigin = process.env.FRONTEND_URL || 'http://localhost:3000';
const mongoUri = process.env.MONGODB_URI;

const roleNavigation = [
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

const dashboardData = {
  learnerOverview: {
    fullName: 'Assigned Student',
    gradeLevel: 11,
    pathway: 'STEM',
    attendanceRate: '94%',
    overallCompetency: 'Developing',
  },
  metrics: [
    { title: 'Competencies Assessed', value: '18', subtitle: 'Across Term 2' },
    { title: 'Mastery Level', value: '6', subtitle: 'Competencies at mastery' },
    { title: 'Average Score', value: '78%', subtitle: 'Continuous assessment' },
    { title: 'Pending Tasks', value: '4', subtitle: 'Due this week' },
  ],
  pathways: ['STEM', 'Social Sciences', 'Arts & Sports'],
  roleNavigation,
};

function sendJson(res, statusCode, payload) {
  res.writeHead(statusCode, {
    'Access-Control-Allow-Origin': allowedOrigin,
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Content-Type': 'application/json',
  });
  res.end(JSON.stringify(payload));
}

async function connectDatabase() {
  if (!mongoUri) {
    console.log('MONGODB_URI not set. Auth routes will require a database connection.');
    return;
  }

  await mongoose.connect(mongoUri);
  console.log('Connected to MongoDB.');
}

const server = http.createServer(async (req, res) => {
  if (req.method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': allowedOrigin,
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    });
    res.end();
    return;
  }

  if (req.url === '/api/health' && req.method === 'GET') {
    sendJson(res, 200, {
      status: 'ok',
      service: 'cbc-learning-platform-backend',
      frontendOrigin: allowedOrigin,
      database: mongoose.connection.readyState === 1 ? 'connected' : 'not-connected',
    });
    return;
  }

  if (await handleAuthRoutes(req, res, sendJson)) {
    return;
  }

  if (req.url === '/api/dashboard' && req.method === 'GET') {
    sendJson(res, 200, dashboardData);
    return;
  }

  sendJson(res, 404, { error: 'Route not found' });
});

connectDatabase()
  .then(() => {
    server.listen(port, () => {
      console.log(`CBC Learning Platform API listening on port ${port}.`);
    });
  })
  .catch((error) => {
    console.error('Failed to start backend API:', error);
    process.exit(1);
  });
    
    
