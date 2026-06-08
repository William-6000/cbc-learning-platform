+# CBC Learning Platform (Grades 10–12)
+
+Starter scaffold for an online CBC curriculum platform supporting:
+
+- **STEM**
+- **Social Sciences**
+- **Arts & Sports**
+
+This repository includes:
+
+- A **backend API and data model layer** using a Node.js HTTP API and Mongoose schemas for senior school learners, competency tracking, pathways, and assessments.
+- A **frontend Next.js (App Router) dashboard shell** with Tailwind CSS styling for role-based navigation, pathway visibility, and performance metrics.
+
+## Project Structure
+
+- `backend/models/` – Mongoose schema blueprints
+- `backend/server.js` – Node.js HTTP API exposing health and dashboard endpoints
+- `frontend/` – Next.js interface shell
+- `render.yaml` – Render Blueprint for separate backend and frontend services
+
+## Quick Start
+
+### 1) Backend
+
+```bash
+cd backend
+npm install
+npm run dev
+```
+
+The API runs on `http://localhost:4000` by default and exposes:
+
+- `GET /api/health` – backend status and allowed frontend origin
+- `GET /api/dashboard` – sample CBC dashboard data, curriculum pathways, and student/teacher/admin navigation links
+
+Optional backend environment variables:
+
+```bash
+PORT=4000
+MONGODB_URI=mongodb+srv://...
+FRONTEND_URL=http://localhost:3000
+```
+
+### 2) Frontend
+
+```bash
+cd frontend
+npm install
+npm run dev
+```
+
+Open `http://localhost:3000`.
+
+The frontend reads backend data from `NEXT_PUBLIC_API_URL`. If the backend is not available, it safely falls back to bundled sample data so the UI can still render.
+
+```bash
+NEXT_PUBLIC_API_URL=http://localhost:4000
+```
+
+## Current Frontend Features
+
+- Student, teacher, and admin navigation cards for role-specific workflows.
+- Learner dashboard metrics for competency tracking, mastery, average score, and pending tasks.
+- Backend connection status banner showing whether live API data or fallback sample data is being used.
+
+## Next Recommended Step
+
+Choose one implementation path:
+
+1. User Authentication API (students, teachers, admins)
+2. Database-backed CRUD routes for users, pathways, and assessments
+3. AI-powered assessment generator module
