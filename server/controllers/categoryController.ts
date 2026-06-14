import { Request, Response } from 'express';
import { Prisma } from '@prisma/client';
import * as svc from '../services/categoryService';

function handleErr(res: Response, e: unknown) {
  if (e instanceof Prisma.PrismaClientKnownRequestError) {
    if (e.code === 'P2002') return res.status(409).json({ error: 'Category already exists.' });
  }
  res.status(500).json({ error: e instanceof Error ? e.message : 'Server error.' });
}

function slugify(str: string) {
  return str.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
}

export async function listCategories(_req: Request, res: Response) {
  try { res.json(await svc.getCategories()); }
  catch (e) { handleErr(res, e); }
}

export async function createCategory(req: Request, res: Response) {
  try {
    const { name, icon } = req.body;
    if (!name) return res.status(400).json({ error: 'name is required.' });
    res.status(201).json(await svc.createCategory({ name, slug: slugify(name), icon }));
  } catch (e) { handleErr(res, e); }
}

export async function updateCategory(req: Request, res: Response) {
  try {
    res.json(await svc.updateCategory(parseInt(req.params.id), req.body));
  } catch (e) { handleErr(res, e); }
}

export async function deleteCategory(req: Request, res: Response) {
  try {
    await svc.deleteCategory(parseInt(req.params.id));
    res.json({ message: 'Category deleted.' });
  } catch (e) { handleErr(res, e); }
}
