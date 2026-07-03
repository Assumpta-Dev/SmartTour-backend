import { Router } from 'express';
import { listLocations, getLocation, createLocation, updateLocation, deleteLocation } from '../controllers/locationController';
import { listCategories, createCategory, updateCategory, deleteCategory } from '../controllers/categoryController';
import { listItems, getItem, createItem, updateItem, deleteItem, deleteMediaItem } from '../controllers/itemController';
import { getNearbyLocations } from '../controllers/nearbyController';
import { adminAuth } from '../middleware/adminAuth';
import { upload } from '../config/cloudinary';

const router = Router();

router.get('/nearby', getNearbyLocations);

router.get('/locations',                   listLocations);
router.get('/locations/:slug',             getLocation);
router.post('/locations',                  adminAuth, upload.fields([{ name: 'image', maxCount: 1 }, { name: 'video', maxCount: 1 }]), createLocation);
router.put('/locations/:id',               adminAuth, upload.fields([{ name: 'image', maxCount: 1 }, { name: 'video', maxCount: 1 }]), updateLocation);
router.delete('/locations/:id',            adminAuth, deleteLocation);

router.get('/categories',                  listCategories);
router.post('/categories',                 adminAuth, upload.fields([{ name: 'images', maxCount: 20 }]), createCategory);
router.put('/categories/:id',              adminAuth, upload.fields([{ name: 'images', maxCount: 20 }]), updateCategory);
router.delete('/categories/:id',           adminAuth, deleteCategory);

router.get('/items',                       listItems);
router.get('/items/:slug',                 getItem);
router.post('/items',                      adminAuth, upload.fields([{ name: 'images', maxCount: 10 }, { name: 'audio', maxCount: 1 }, { name: 'video', maxCount: 1 }]), createItem);
router.put('/items/:id',                   adminAuth, upload.fields([{ name: 'images', maxCount: 10 }, { name: 'audio', maxCount: 1 }, { name: 'video', maxCount: 1 }]), updateItem);
router.delete('/items/:id',                adminAuth, deleteItem);
router.delete('/items/:id/media/:mediaId', adminAuth, deleteMediaItem);

export default router;
