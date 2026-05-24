import { Router } from 'express';
import {
  listObjects, getObject, getByNfc, getByQr,
  getNearby, createObj, updateObj, deleteObj,
} from '../controllers/objectController';
import { adminAuth } from '../middleware/adminAuth';
import multer from 'multer';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import { v2 as cloudinary } from 'cloudinary';

const storage = new CloudinaryStorage({
  cloudinary,
  params: (req: any, file: Express.Multer.File) => {
    if (file.fieldname === 'audio') {
      return { folder: 'smart-tourism/audio', allowed_formats: ['mp3', 'wav', 'ogg', 'm4a'], resource_type: 'video' };
    }
    return { folder: 'smart-tourism/images', allowed_formats: ['jpg', 'jpeg', 'png', 'webp'], transformation: [{ width: 1200, crop: 'limit' }] };
  },
});

const upload = multer({
  storage,
  fileFilter: (_req, file, cb) => {
    const imageTypes = ['image/jpeg', 'image/png', 'image/webp'];
    const audioTypes = ['audio/mpeg', 'audio/wav', 'audio/ogg', 'audio/mp4', 'audio/x-m4a'];
    if (file.fieldname === 'image' && !imageTypes.includes(file.mimetype)) {
      return cb(new Error('Image field only accepts jpg, png, or webp files.'));
    }
    if (file.fieldname === 'audio' && !audioTypes.includes(file.mimetype)) {
      return cb(new Error('Audio field only accepts mp3, wav, ogg, or m4a files.'));
    }
    cb(null, true);
  },
});

const router = Router();

// Public — no auth required
router.get('/objects',            listObjects);
router.get('/objects/nearby',     getNearby);
router.get('/objects/nfc/:nfcId', getByNfc);
router.get('/objects/qr/:qrCode', getByQr);
router.get('/objects/:id',        getObject);

// Admin only — requires Bearer JWT token
router.post('/objects',       adminAuth, upload.fields([{ name: 'image', maxCount: 1 }, { name: 'audio', maxCount: 1 }]), createObj);
router.put('/objects/:id',    adminAuth, upload.fields([{ name: 'image', maxCount: 1 }, { name: 'audio', maxCount: 1 }]), updateObj);
router.delete('/objects/:id', adminAuth, deleteObj);

export default router;
