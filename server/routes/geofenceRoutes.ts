import { Router } from 'express';
import { checkGeofence } from '../controllers/geofenceController';

const router = Router();
router.post('/check', checkGeofence);
export default router;
