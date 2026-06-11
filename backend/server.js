import { getSubjects, grades, pathwayThemes, subjectsByPathway } from './data/subjects.js';


function normalizePathname(url) {
  return new URL(url, allowedOrigin).pathname.replace(/\/+$/, '') || '/';
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

  const pathname = normalizePathname(req.url);

  if (pathname === '/api/subjects' && req.method === 'GET') {
    sendJson(res, 200, buildSubjectsPayload());
    return;
  }

  if (pathname.startsWith('/api/subjects/') && req.method === 'GET') {
    const [, , , pathway, grade] = pathname.split('/');
    const decodedPathway = decodeURIComponent(pathway || '');

    if (!subjectsByPathway[decodedPathway]) {
      sendJson(res, 404, { error: 'Subject pathway not found' });
      return;
    }

        if (grade) {
      const decodedGrade = Number(decodeURIComponent(grade));

      if (!grades.includes(decodedGrade)) {
        sendJson(res, 404, { error: 'Grade not found for subjects endpoint' });
        return;
      }

      sendJson(res, 200, buildSubjectsPayload(decodedPathway, String(decodedGrade)));
      return;
    }

    sendJson(res, 200, buildSubjectsPayload(decodedPathway));
    return;
  }

