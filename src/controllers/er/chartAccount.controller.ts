import { Request, Response } from 'express';
import { ChartAccount } from '../../models/er/chartAccount.model';

export const getAccounts = async (_req: Request, res: Response) => {
  const accounts = await ChartAccount.find();
  res.json(accounts);
};

export const getAccount = async (req: Request, res: Response) => {
  const account = await ChartAccount.findById(req.params.id);
  res.json(account);
};

export const createAccount = async (req: Request, res: Response) => {
  const account = new ChartAccount(req.body);
  await account.save();
  res.status(201).json(account);
};

export const updateAccount = async (req: Request, res: Response) => {
  const updated = await ChartAccount.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json(updated);
};

export const deleteAccount = async (req: Request, res: Response) => {
  await ChartAccount.findByIdAndDelete(req.params.id);
  res.status(204).send();
};

export const getAccountTree = async (_req: Request, res: Response) => {
  const accounts = await ChartAccount.find().lean();
  const map = new Map<string, any>();
  accounts.forEach((acc: any) => {
    map.set(acc._id.toString(), { ...acc, children: [] });
  });
  const roots: any[] = [];
  map.forEach((acc) => {
    if (acc.parent) {
      const parent = map.get(acc.parent.toString());
      if (parent) parent.children.push(acc);
    } else {
      roots.push(acc);
    }
  });
  res.json(roots);
};
