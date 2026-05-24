import { Request, Response, NextFunction } from 'express';

export function requireBody(fields: string[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    for (const field of fields) {
      if (req.body[field] === undefined)
        return res.status(400).json({ error: `${field} is required` });
    }
    next();
  };
}
