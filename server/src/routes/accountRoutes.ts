import express from 'express';
import {
    deactivateAccount,
    getProfile,
    toggleBiometrics,
    updateAddresses,
    updateEmergencyContacts,
    updatePassword,
    updateProfile
} from '../controllers/accountController';
import { authMiddleware } from '../middleware/authMiddleware';

const router = express.Router();

router.use(authMiddleware); // All account routes are protected

router.get('/profile', getProfile);
router.put('/profile', updateProfile);
router.put('/security/password', updatePassword);
router.put('/security/biometrics', toggleBiometrics);
router.post('/addresses', updateAddresses);
router.post('/emergency-contacts', updateEmergencyContacts);
router.delete('/', deactivateAccount);

export default router;
