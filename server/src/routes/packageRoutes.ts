import { Router } from 'express';
import { handlePackageUpdate, getPackages, getPackageDetails } from '../controllers/packageController';

const router = Router();

router.post('/packages', handlePackageUpdate);
router.get('/packages', getPackages);
router.get('/packages/:id', getPackageDetails);

export default router;