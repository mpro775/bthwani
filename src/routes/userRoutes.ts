import { Router } from 'express';
import { verifyFirebase } from '../middleware/verifyFirebase';
import {
  registerOrUpdateUser,
  getCurrentUser,
  updateProfile,
  updateSecurity,
  setPinCode,
  verifyPinCode,
  getUserStats,
  deactivateAccount,
  getAddresses,
} from '../controllers/userController';
import { addAddress, deleteAddress, setDefaultAddress, updateAddress } from '../controllers/addressController';
import { getTransactions, getTransferHistory, getWallet, transferFunds } from '../controllers/walletController';
import {
  followUser,
  unfollowUser,
  getFollowers,
  getFollowing,
  getActivityLog
} from "../controllers/socialController";
import { updateBloodSettings, updateFreelancerProfile } from '../controllers/extraUserController';
import { getNotifications, markAllNotificationsRead } from '../controllers/notificationsController';

const router = Router();

router.post('/init', verifyFirebase, registerOrUpdateUser);
router.get('/me', verifyFirebase, getCurrentUser);
router.patch('/profile', verifyFirebase, updateProfile);
router.patch('/security', verifyFirebase, updateSecurity);
router.post('/address', verifyFirebase, addAddress);
router.patch('/address/:id', verifyFirebase, updateAddress);
router.delete('/address/:id', verifyFirebase, deleteAddress);
router.patch('/default-address', verifyFirebase, setDefaultAddress);
router.get('/wallet', verifyFirebase, getWallet);
router.get('/transactions', verifyFirebase, getTransactions);
router.patch('/blood-settings', verifyFirebase, updateBloodSettings);
router.patch('/freelancer-profile', verifyFirebase, updateFreelancerProfile);
router.post("/follow/:targetId", verifyFirebase, followUser);
router.delete("/unfollow/:targetId", verifyFirebase, unfollowUser);
router.get("/:id/followers", getFollowers);
router.get("/:id/following", getFollowing);
router.get("/activity", verifyFirebase, getActivityLog);
router.patch("/security/set-pin", verifyFirebase, setPinCode);
router.patch("/security/verify-pin", verifyFirebase, verifyPinCode);

router.get("/notifications", verifyFirebase, getNotifications);
router.patch("/notifications/mark-read", verifyFirebase, markAllNotificationsRead);
router.post("/wallet/transfer", verifyFirebase, transferFunds);
router.get("/wallet/transfer-history", verifyFirebase, getTransferHistory);
router.get("/me/stats", verifyFirebase, getUserStats);
router.delete("/me/deactivate", verifyFirebase, deactivateAccount);
router.get('/address', verifyFirebase, getAddresses);

export default router;