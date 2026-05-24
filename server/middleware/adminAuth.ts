import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export function adminAuth(req: Request, res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized: missing or malformed token.' });
  }
  try {
    jwt.verify(header.split(' ')[1], process.env.JWT_SECRET!);
    next();
  } catch {
    res.status(401).json({ error: 'Unauthorized: invalid or expired token.' });
  }
}
