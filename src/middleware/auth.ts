import { Request, Response, NextFunction } from 'express';

export function authMiddleware(
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  const rid = req.get('X-User-Id'); // real/raw id

  if (!rid) {
    res.status(401).json({ error: '401 Unauthorized'});
    return;
  }
  
  const uid = Number(rid);

  if (!Number.isInteger(uid) || uid <= 0) {
    res.status(401).json({ error: '401 Unauthorized'});
    return;
  }

  res.locals.userId = uid;
  
  next();
}

export default authMiddleware;
