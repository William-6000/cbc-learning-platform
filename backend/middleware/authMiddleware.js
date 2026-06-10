import jwt from 'jsonwebtoken';

const jwtSecret = process.env.JWT_SECRET || 'replace-this-development-secret';

export function verifyAuthToken(req, res, sendJson) {
  const authHeader = req.headers.authorization || '';
  const [scheme, token] = authHeader.split(' ');

  if (scheme !== 'Bearer' || !token) {
    sendJson(res, 401, { error: 'Authentication token is required.' });
    return false;
  }

  try {
    req.user = jwt.verify(token, jwtSecret);
    return true;
  } catch (error) {
    sendJson(res, 401, { error: 'Invalid or expired authentication token.' });
    return false;
  }
}

export function requireRole(allowedRoles = []) {
  return (req, res, sendJson) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      sendJson(res, 403, { error: 'You do not have permission to access this route.' });
      return false;
    }

    return true;
  };
}
