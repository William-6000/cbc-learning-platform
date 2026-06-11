import { handleSubjectsRoutes } from './routes/subjec
  } else if (req.url === '/api/health' && req.method === 'GET') {
      } else if (await handleAuthRoutes(req, res, sendJson)) {
    // Auth route handled the response.
  } else if (req.url === '/api/dashboard' && req.method === 'GET') {
      } else if (handleSubjectsRoutes(req, res, sendJson, allowedOrigin)) {
    // Subjects route handled the response.
  } else {
    sendJson(res, 404, { error: 'Route not found' });
  
