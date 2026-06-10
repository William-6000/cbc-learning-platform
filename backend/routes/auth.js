import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';

import { verifyAuthToken } from '../middleware/authMiddleware.js';
import User from '../models/User.js';

const jwtSecret = process.env.JWT_SECRET || 'replace-this-development-secret';
const jwtExpiresIn = process.env.JWT_EXPIRES_IN || '1d';
const supportedRoles = ['student', 'teacher', 'admin'];
const supportedPathways = ['STEM', 'Social Sciences', 'Arts & Sports'];

function readJsonBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';

    req.on('data', (chunk) => {
      body += chunk.toString();
    });

    req.on('end', () => {
      if (!body) {
        resolve({});
        return;
      }

      try {
        resolve(JSON.parse(body));
      } catch (error) {
        reject(new Error('Invalid JSON request body.'));
      }
    });

    req.on('error', reject);
  });
}

function splitName(name = '') {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  const firstName = parts.shift() || '';
  const lastName = parts.join(' ') || 'User';

  return { firstName, lastName };
}

function createToken(user) {
  return jwt.sign(
    {
      userId: user._id.toString(),
      email: user.email,
      role: user.role,
    },
    jwtSecret,
    { expiresIn: jwtExpiresIn },
  );
}

function toSafeUser(user) {
  return {
    id: user._id.toString(),
    name: `${user.firstName} ${user.lastName}`.trim(),
    email: user.email,
    role: user.role,
    grade: user.gradeLevel,
    pathway: user.pathway,
  };
}

function isDatabaseConnected() {
  return mongoose.connection.readyState === 1;
}

function validateRegistrationPayload(payload) {
  const { name, email, password, role = 'student', grade, pathway } = payload;
  const errors = [];

  if (!name?.trim()) errors.push('Name is required.');
  if (!email?.trim()) errors.push('Email is required.');
  if (!password || password.length < 8) errors.push('Password must be at least 8 characters.');
  if (!supportedRoles.includes(role)) errors.push('Role must be student, teacher, or admin.');

  if (role === 'student') {
    if (!grade || ![10, 11, 12].includes(Number(grade))) {
      errors.push('Student grade must be 10, 11, or 12.');
    }

    if (!supportedPathways.includes(pathway)) {
      errors.push('Student pathway must be STEM, Social Sciences, or Arts & Sports.');
    }
  }

  return errors;
}

export async function handleAuthRoutes(req, res, sendJson) {
  const { pathname } = new URL(req.url, 'http://localhost');

  if (pathname === '/api/auth/register' && req.method === 'POST') {
    if (!isDatabaseConnected()) {
      sendJson(res, 503, { error: 'Database connection is required to register users.' });
      return true;
    }

    try {
      const payload = await readJsonBody(req);
      const errors = validateRegistrationPayload(payload);

      if (errors.length) {
        sendJson(res, 400, { errors });
        return true;
      }

      const { name, email, password, role = 'student', grade, pathway } = payload;
      const existingUser = await User.findOne({ email });

      if (existingUser) {
        sendJson(res, 409, { error: 'A user with this email already exists.' });
        return true;
      }

      const { firstName, lastName } = splitName(name);
      const passwordHash = await bcrypt.hash(password, 12);
      const user = await User.create({
        firstName,
        lastName,
        email,
        password: passwordHash,
        role,
        gradeLevel: grade ? Number(grade) : undefined,
        pathway: pathway || undefined,
      });
      const token = createToken(user);

      sendJson(res, 201, { token, user: toSafeUser(user) });
    } catch (error) {
      sendJson(res, 500, { error: error.message || 'Registration failed.' });
    }

    return true;
  }

  if (pathname === '/api/auth/login' && req.method === 'POST') {
    if (!isDatabaseConnected()) {
      sendJson(res, 503, { error: 'Database connection is required to log in.' });
      return true;
    }

    try {
      const { email, password } = await readJsonBody(req);

      if (!email || !password) {
        sendJson(res, 400, { error: 'Email and password are required.' });
        return true;
      }

      const user = await User.findOne({ email }).select('+password');

      if (!user) {
        sendJson(res, 401, { error: 'Invalid email or password.' });
        return true;
      }

      const isPasswordValid = await bcrypt.compare(password, user.password);

      if (!isPasswordValid) {
        sendJson(res, 401, { error: 'Invalid email or password.' });
        return true;
      }

      const token = createToken(user);

      sendJson(res, 200, { token, user: toSafeUser(user) });
    } catch (error) {
      sendJson(res, 500, { error: error.message || 'Login failed.' });
    }

    return true;
  }

  if (pathname === '/api/auth/me' && req.method === 'GET') {
    if (!verifyAuthToken(req, res, sendJson)) {
      return true;
    }

    sendJson(res, 200, { user: req.user });
    return true;
  }

  return false;
}
