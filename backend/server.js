import { handleSubjectsRoutes } from './routes/subjects.js';

  if (handleSubjectsRoutes(req, res, sendJson, allowedOrigin)) {
    return;
  }
