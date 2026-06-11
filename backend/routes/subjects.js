import { getSubjects, grades, pathwayThemes, subjectsByPathway } from '../data/subjects.js';

function normalizePathname(url, origin) {
  return new URL(url, origin).pathname.replace(/\/+$/, '') || '/';
}

function buildSubjectsPayload(pathway = 'all', grade = 'all') {
  const subjects = getSubjects({ pathway, grade });
  const scopedSubjects = grade === 'all'
    ? subjects
    : subjects.map((subject) => ({
        ...subject,
        topicsByGrade: {
          [grade]: subject.topicsByGrade[grade],
        },
      }));

  return {
    pathways: Object.values(pathwayThemes).map(({ name, slug, color, pageHref }) => ({
      name,
      slug,
      color,
      pageHref,
    })),
    grades,
    selectedPathway: pathway,
    selectedGrade: grade,
    subjects: scopedSubjects,
  };
}

export function handleSubjectsRoutes(req, res, sendJson, origin) {
  if (req.method !== 'GET') {
    return false;
  }

  const pathname = normalizePathname(req.url, origin);

  if (pathname === '/api/subjects') {
    sendJson(res, 200, buildSubjectsPayload());
    return true;
  }

  if (!pathname.startsWith('/api/subjects/')) {
    return false;
  }

  const [, , , pathway, grade] = pathname.split('/');
  const decodedPathway = decodeURIComponent(pathway || '');

  if (!subjectsByPathway[decodedPathway]) {
    sendJson(res, 404, { error: 'Subject pathway not found' });
    return true;
  }

  if (!grade) {
    sendJson(res, 200, buildSubjectsPayload(decodedPathway));
    return true;
  }

  const decodedGrade = Number(decodeURIComponent(grade));

  if (!grades.includes(decodedGrade)) {
    sendJson(res, 404, { error: 'Grade not found for subjects endpoint' });
    return true;
  }

  sendJson(res, 200, buildSubjectsPayload(decodedPathway, String(decodedGrade)));
  return true;
}
