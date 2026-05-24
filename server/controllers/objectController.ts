import { Request, Response } from 'express';
import { Prisma } from '@prisma/client';
import {
  getAllObjects, getObjectById, getObjectByNfc, getObjectByQr,
  getNearbyObjects, createObject, updateObject, deleteObject,
} from '../services/objectService';
import cloudinary from '../config/cloudinary';

function handleError(res: Response, e: unknown) {
  if (e instanceof Prisma.PrismaClientKnownRequestError) {
    if (e.code === 'P2002') {
      const field = (e.meta?.target as string[])?.join(', ') ?? 'field';
      return res.status(409).json({ error: `A record with this ${field} already exists.` });
    }
    if (e.code === 'P2025') {
      return res.status(404).json({ error: 'Record not found.' });
    }
  }
  const message = e instanceof Error ? e.message : 'Unexpected server error';
  res.status(500).json({ error: message });
}

export async function listObjects(req: Request, res: Response) {
  try {
    const page  = Math.max(1, parseInt(req.query.page  as string) || 1);
    const limit = Math.min(100, parseInt(req.query.limit as string) || 20);
    const type  = req.query.type as string | undefined;
    const result = await getAllObjects(page, limit, type);
    res.json(result);
  } catch (e) {
    handleError(res, e);
  }
}

export async function getObject(req: Request, res: Response) {
  try {
    const obj = await getObjectById(req.params.id);
    if (!obj) return res.status(404).json({ error: 'Object not found.' });
    res.json(obj);
  } catch (e) {
    handleError(res, e);
  }
}

export async function getByNfc(req: Request, res: Response) {
  try {
    const obj = await getObjectByNfc(req.params.nfcId);
    if (!obj) return res.status(404).json({ error: 'No object found for this NFC tag.' });
    res.json(obj);
  } catch (e) {
    handleError(res, e);
  }
}

export async function getByQr(req: Request, res: Response) {
  try {
    const obj = await getObjectByQr(req.params.qrCode);
    if (!obj) return res.status(404).json({ error: 'No object found for this QR code.' });
    res.json(obj);
  } catch (e) {
    handleError(res, e);
  }
}

export async function getNearby(req: Request, res: Response) {
  try {
    const lat    = parseFloat(req.query.lat    as string);
    const lng    = parseFloat(req.query.lng    as string);
    const radius = parseFloat(req.query.radius as string) || 200;
    if (isNaN(lat) || isNaN(lng)) {
      return res.status(400).json({ error: 'lat and lng must be valid numbers.' });
    }
    const results = await getNearbyObjects(lat, lng, radius);
    res.json(results);
  } catch (e) {
    handleError(res, e);
  }
}

export async function createObj(req: Request, res: Response) {
  try {
    const { name, type, description, latitude, longitude, audioUrl, nfcId, qrCode } = req.body;
    if (!name || !type || !description || !latitude || !longitude) {
      return res.status(400).json({ error: 'name, type, description, latitude and longitude are required.' });
    }
    const files  = req.files as Record<string, Express.Multer.File[]>;
    const imageUrl = (files?.image?.[0] as any)?.path;
    const resolvedAudioUrl = (files?.audio?.[0] as any)?.path ?? audioUrl;
    const obj = await createObject({
      name, type, description,
      latitude:  parseFloat(latitude),
      longitude: parseFloat(longitude),
      imageUrl,
      audioUrl: resolvedAudioUrl,
      nfcId:  nfcId  || undefined,
      qrCode: qrCode || undefined,
    });
    res.status(201).json(obj);
  } catch (e) {
    handleError(res, e);
  }
}

export async function updateObj(req: Request, res: Response) {
  try {
    const data: any = { ...req.body };
    const files = req.files as Record<string, Express.Multer.File[]>;
    if (files?.image?.[0]) data.imageUrl = (files.image[0] as any).path;
    if (files?.audio?.[0]) data.audioUrl = (files.audio[0] as any).path;
    if (data.latitude)  data.latitude  = parseFloat(data.latitude);
    if (data.longitude) data.longitude = parseFloat(data.longitude);
    if (data.nfcId  === '') data.nfcId  = undefined;
    if (data.qrCode === '') data.qrCode = undefined;
    const obj = await updateObject(req.params.id, data);
    res.json(obj);
  } catch (e) {
    handleError(res, e);
  }
}

export async function deleteObj(req: Request, res: Response) {
  try {
    const obj = await getObjectById(req.params.id);
    if (!obj) return res.status(404).json({ error: 'Object not found.' });
    if (obj.imageUrl) {
      const publicId = obj.imageUrl.split('/').slice(-2).join('/').replace(/\.[^/.]+$/, '');
      await cloudinary.uploader.destroy(publicId);
    }
    await deleteObject(req.params.id);
    res.json({ message: 'Object deleted successfully.' });
  } catch (e) {
    handleError(res, e);
  }
}
