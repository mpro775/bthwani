import { Request, Response } from 'express';
import { Account } from '../../models/er/account.model';

export const getAllAccounts = async (_req: Request, res: Response) => {
  const accounts = await Account.find();
  res.json(accounts);
};

export const getAccountById = async (req: Request, res: Response) => {
  const account = await Account.findById(req.params.id);
  res.json(account);
};

export const createAccount = async (req: Request, res: Response) => {
  const account = new Account(req.body);
  await account.save();
  res.status(201).json(account);
};

export const updateAccount = async (req: Request, res: Response) => {
  const account = await Account.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json(account);
};

export const deleteAccount = async (req: Request, res: Response) => {
  await Account.findByIdAndDelete(req.params.id);
  res.status(204).send();
};

