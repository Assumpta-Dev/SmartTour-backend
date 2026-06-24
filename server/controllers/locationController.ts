import { Request, Response } from 'express';
import { Prisma } from '@prisma/client';
import * as svc from '../services/locationService';
import cloudinary from '../config/cloudinary';

function slugify(str: string) {
  return str.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
}

function handleErr(res: Response, e: unknown) {
  if (e instanceof Prisma.PrismaClientKnownRequestError) {
    if (e.code === 'P2002') return res.status(409).json({ error: 'A location with this name already exists.' });
    if (e.code === 'P2025') return res.status(404).json({ error: 'Location not found.' });
  }
  res.status(500).json({ error: e instanceof Error ? e.message : 'Server error.' });
}

export async function listLocations(req: Request, res: Response) {
  try {
    const featured = req.query.featured === 'true' ? true : undefined;
    res.json(await svc.getLocations(featured));
  } catch (e) { handleErr(res, e); }
}

export async function getLocation(req: Request, res: Response) {
  try {
    const loc = await svc.getLocationBySlug(req.params.slug);
    if (!loc) return res.status(404).json({ error: 'Location not found.' });
    res.json(loc);
  } catch (e) { handleErr(res, e); }
}

export async function createLocation(req: Request, res: Response) {
  try {
    const { name, description, videoUrl, latitude, longitude, featured } = req.body;
    if (!name || !description) return res.status(400).json({ error: 'name and description are required.' });
    const files = req.files as Record<string, Express.Multer.File[]>;
    const coverImage = (files?.image?.[0] as any)?.path;
    const uploadedVideo = (files?.video?.[0] as any)?.path;
    const loc = await svc.createLocation({
      name, slug: slugify(name), description, coverImage,
      videoUrl: uploadedVideo ?? videoUrl,
      latitude:  latitude  ? parseFloat(latitude)  : undefined,
      longitude: longitude ? parseFloat(longitude) : undefined,
      featured:  featured === 'true',
    });
    res.status(201).json(loc);
  } catch (e) { handleErr(res, e); }
}

export async function updateLocation(req: Request, res: Response) {
  try {
    const id = parseInt(req.params.id);
    const { name, description, videoUrl, latitude, longitude, featured } = req.body;
    const data: any = {};
    if (name)        data.name        = name;
    if (description) data.description = description;
    if (videoUrl)    data.videoUrl    = videoUrl;
    if (latitude)    data.latitude    = parseFloat(latitude);
    if (longitude)   data.longitude   = parseFloat(longitude);
    if (featured !== undefined) data.featured = featured === 'true';
    const files = req.files as Record<string, Express.Multer.File[]>;
    if (files?.image?.[0]) data.coverImage = (files.image[0] as any).path;
    if (files?.video?.[0]) data.videoUrl   = (files.video[0] as any).path;
    res.json(await svc.updateLocation(id, data));
  } catch (e) { handleErr(res, e); }
}

export async function deleteLocation(req: Request, res: Response) {
  try {
    const id  = parseInt(req.params.id);
    const loc = await svc.getLocationById(id);
    if (!loc) return res.status(404).json({ error: 'Location not found.' });
    if (loc.coverImage) {
      const pub = loc.coverImage.split('/').slice(-2).join('/').replace(/\.[^/.]+$/, '');
      await cloudinary.uploader.destroy(pub).catch(() => null);
    }
    await svc.deleteLocation(id);
    res.json({ message: 'Location deleted.' });
  } catch (e) { handleErr(res, e); }
}
