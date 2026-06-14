import { Router, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import prisma from '../config/db';
import { adminAuth } from '../middleware/adminAuth';

const router = Router();

router.post('/login', async (req: Request, res: Response) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ error: 'username and password are required.' });
  }

  const admin = await prisma.admin.findUnique({ where: { username } });
  if (!admin) {
    return res.status(401).json({ error: 'Invalid credentials.' });
  }

  const valid = await bcrypt.compare(password, admin.password);
  if (!valid) {
    return res.status(401).json({ error: 'Invalid credentials.' });
  }

  const secret = process.env.JWT_SECRET;
  if (!secret) {
    return res.status(500).json({ error: 'JWT secret is not configured.' });
  }

  const token = jwt.sign({ id: admin.id, role: 'admin' }, secret, { expiresIn: '8h' });
  res.json({ token });
});

router.get('/stats', adminAuth, async (_req: Request, res: Response) => {
  const [locations, categories, items, media, zones, objects] = await Promise.all([
    prisma.location.count(),
    prisma.category.count(),
    prisma.item.count(),
    prisma.media.count(),
    prisma.zone.count(),
    prisma.object.count(),
  ]);
  const topItems = await prisma.item.findMany({
    orderBy: { viewCount: 'desc' },
    take: 5,
    select: { id: true, name: true, slug: true, viewCount: true, category: { select: { name: true } } },
  });
  res.json({ locations, categories, items, media, zones, objects, topItems });
});

export default router;
