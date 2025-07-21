import { Router } from 'express';
import { handlePackageUpdate, getPackages, getPackageDetails } from '../controllers/packageController';

const router = Router();

router.post('/package', handlePackageUpdate);
router.get('/package', getPackages);
router.get('/package/:id', getPackageDetails);

export default router;