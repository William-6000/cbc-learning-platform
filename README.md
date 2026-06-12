# CBC Senior School Learning Platform for Kenya

A deployment-ready full-stack learning platform for Kenya's Competency-Based Curriculum (CBC) Senior School Grades 10–12. It supports all KICD Senior School pathways:

- **STEM** — Mathematics, sciences, computer science, agriculture and technical subjects.
- **Social Sciences** — Humanities, business and languages.
- **Arts & Sports** — Visual arts, music, drama, home science, aviation, maritime and PE/sports.

The app is mobile-first for Kenyan school contexts where many learners use phones, and includes a subtle Kenyan flag ribbon in the header.

## Tech stack

- **Frontend:** React, Tailwind CSS, React Router v6, Jest + React Testing Library configuration.
- **Backend:** Node.js, Express REST API, JWT role-based access.
- **Database:** PostgreSQL with Prisma ORM and a checked-in migration.
- **Storage:** Cloudinary-ready environment variables and URL fields for media/documents.
- **Deployment:** Docker and docker-compose for local or server deployment.

## Repository structure

```text
/client                 React frontend
  /src/pages            One file per route
  /src/components       Reusable UI components
  /src/hooks            Custom hooks
  /src/context          AuthContext and PathwayContext
  /src/utils            API and i18n helpers
/server                 Express backend
  /src                  API app, auth middleware, Prisma client
  /prisma               schema.prisma, migration, seed.js
/docker-compose.yml     PostgreSQL + API + React client
/.env.example           Required environment variables
```

> The older `frontend/` and `backend/` starter directories are retained for history. New CBC implementation work lives in `client/` and `server/`.

## Local setup for school ICT admins

### 1. Configure environment

```bash
cp .env.example .env
```

Update `JWT_SECRET` and Cloudinary settings in `.env`. For local PostgreSQL via Docker, the default `DATABASE_URL` works with the supplied compose file.

### 2. Run with Docker Compose

```bash
docker compose up --build
```

Services:

- React client: <http://localhost:5173>
- Express API: <http://localhost:4000>
- PostgreSQL: `localhost:5432`

The server container runs `prisma migrate deploy` and `npm run seed` at startup.

### 3. Run manually without Docker

Start PostgreSQL, then:

```bash
cd server
npm install
npx prisma migrate deploy --schema prisma/schema.prisma
npm run seed
npm run dev
```

In a second terminal:

```bash
cd client
npm install
npm run dev
```

## First-login credentials

Seeded accounts all use this password:

```text
Password123!
```

Examples:

- Admin: `admin@cbc.ke`
- STEM teacher: `stemteacher1@cbc.ke`
- STEM student: `stemstudent1@cbc.ke`
- Social Sciences student: `social_sciencesstudent1@cbc.ke`
- Arts & Sports student: `arts_and_sportsstudent1@cbc.ke`

  ## Key features

### Role-based workspaces

- Student dashboard with pathway badge, learning progress ring, upcoming assessments, grades, subject cards and CBC competency tracker.
- Teacher dashboard with roster/progress summaries, grade entry, notes upload, assessment creation, announcements and at-risk learner flagging.
- Parent portal with child progress, attendance summary, grades timeline, messaging and progress report action.
- Admin panel with school/user management actions, CSV import affordance, pathway reports, announcements and analytics.

### CBC-specific support

- Tracks seven CBC core competencies:
  - Communication & Collaboration
  - Critical Thinking & Problem Solving
  - Creativity & Imagination
  - Citizenship
  - Digital Literacy
  - Learning to Learn
  - Self-Efficacy
- Calculates assessment balance as **40% formative + 60% summative/project**.
- Adds project-based learning briefs and rubric JSON to every seeded unit.
- Links every unit to national values and PPI themes such as unity, integrity, sustainability, climate action and digital citizenship.
- - Includes career guidance data for Kenyan careers, KUCCPS course examples and TVET routes per pathway.
- Provides an English/Kiswahili UI toggle foundation.

## API endpoints

| Method | Endpoint | Access |
| --- | --- | --- |
| POST | `/api/auth/register` | Public |
| POST | `/api/auth/login` | Public |
| GET | `/api/pathways` | Public |
| GET | `/api/subjects?pathway=STEM&grade=10` | Public |
| GET | `/api/subjects/:id/units` | Public |
| GET | `/api/units/:id/lessons` | Public |
| POST | `/api/lessons/:id/complete` | Student token |
| GET | `/api/assessments/:id` | Public |
| POST | `/api/assessments/:id/submit` | Student token |
| GET | `/api/students/:id/progress` | Authenticated |
| GET | `/api/students/:id/grades` | Authenticated |
| PUT | `/api/grades/:id` | Teacher/Admin |
| POST | `/api/announcements` | Teacher/Admin |
| GET | `/api/analytics/overview` | Admin |
| POST | `/api/messages` | Authenticated |
| GET | `/api/messages/:userId` | Authenticated |

## How to add a new subject

1. Add the subject name to the matching array in `server/prisma/seed.js` under `subjectMap`.
2. Run the seed command again:

```bash
cd server
npm run seed
```

The seed script creates Grade 10, 11 and 12 subject rows, two units per subject, sample lessons, formative/summative/project assessments and questions.

## How to add a new lesson manually

Use Prisma Studio or an API/admin workflow to create a `Lesson` linked to a `Unit` with:

- `title`
- `contentType`: `video`, `pdf`, `quiz` or `activity`
- `contentUrl`: YouTube embed URL or Cloudinary document/media URL
- `durationMins`
- `notesPrompt`

For media uploads, upload the file to Cloudinary first and store the returned secure URL as `contentUrl` or `TeacherNote.fileUrl`.

## Testing and checks

```bash
cd server && npm test
cd client && npm test
```

If your server has no internet, install dependencies from an internal npm mirror before running tests.
