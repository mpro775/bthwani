import { Router } from 'express';
import {
  getAllAccounts,
  getAccountById,
  createAccount,
  updateAccount,
  deleteAccount,
} from '../../controllers/er/account.controller';

const router = Router();

router.get('/', getAllAccounts);
router.get('/:id', getAccountById);
router.post('/', createAccount);
router.patch('/:id', updateAccount);
router.delete('/:id', deleteAccount);

export default router;

