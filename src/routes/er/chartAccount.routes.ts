import { Router } from 'express';
import {
  getAccounts,
  getAccount,
  createAccount,
  updateAccount,
  deleteAccount,
  getAccountTree,
} from '../../controllers/er/chartAccount.controller';

const router = Router();
router.get('/', getAccounts);
router.get('/tree', getAccountTree);
router.get('/:id', getAccount);
router.post('/', createAccount);
router.patch('/:id', updateAccount);
router.delete('/:id', deleteAccount);
export default router;
