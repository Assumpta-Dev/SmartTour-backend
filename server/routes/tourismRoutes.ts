import { Router } from 'express';
import { listLocations, getLocation, createLocation, updateLocation, deleteLocation } from '../controllers/locationController';
import { listCategories, createCategory, updateCategory, deleteCategory } from '../controllers/categoryController';
import { listItems, getItem, createItem, updateItem, deleteItem, deleteMediaItem } from '../controllers/itemController';
import { getNearbyLocations } from '../controllers/nearbyController';
import { adminAuth } from '../middleware/adminAuth';
import multer from 'multer';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import { v2 as cloudinary } from 'cloudinary';

const storage = new CloudinaryStorage({
  cloudinary,
  params: (req: any, file: Express.Multer.File) => {
    if (file.fieldname === 'audio') return { folder: 'smart-tourism/audio', allowed_formats: ['mp3', 'wav', 'ogg', 'm4a'], resource_type: 'video' };
    if (file.fieldname === 'video') return { folder: 'smart-tourism/videos', allowed_formats: ['mp4', 'mov', 'webm'], resource_type: 'video' };
    return { folder: 'smart-tourism/images', allowed_formats: ['jpg', 'jpeg', 'png', 'webp'], transformation: [{ width: 1400, crop: 'limit' }] };
  },
});

const upload = multer({ storage });

const router = Router();

// GPS unified nearby endpoint (public)
router.get('/nearby', getNearbyLocations);

// Locations — public read, admin write
router.get('/locations',            listLocations);
router.get('/locations/:slug',      getLocation);
router.post('/locations',           adminAuth, upload.fields([{ name: 'image', maxCount: 1 }]), createLocation);
router.put('/locations/:id',        adminAuth, upload.fields([{ name: 'image', maxCount: 1 }]), updateLocation);
router.delete('/locations/:id',     adminAuth, deleteLocation);

// Categories — public read, admin write
router.get('/categories',           listCategories);
router.post('/categories',          adminAuth, createCategory);
router.put('/categories/:id',       adminAuth, updateCategory);
router.delete('/categories/:id',    adminAuth, deleteCategory);

// Items — public read, admin write
router.get('/items',                listItems);
router.get('/items/:slug',          getItem);
router.post('/items',               adminAuth, upload.fields([{ name: 'images', maxCount: 10 }, { name: 'audio', maxCount: 1 }, { name: 'video', maxCount: 1 }]), createItem);
router.put('/items/:id',            adminAuth, upload.fields([{ name: 'images', maxCount: 10 }, { name: 'audio', maxCount: 1 }]), updateItem);
router.delete('/items/:id',         adminAuth, deleteItem);
router.delete('/items/:id/media/:mediaId', adminAuth, deleteMediaItem);

export default router;
