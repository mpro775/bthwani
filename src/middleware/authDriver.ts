import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import Driver, { IDriver } from '../models/Driver';

interface DecodedToken {
  id: string;
}

declare module 'express' {
  interface Request {
    driver?: IDriver;
  }
}

export const authDriver = async (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer '))
    return res.status(401).json({ message: 'توكن مفقود' });

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret123') as DecodedToken;
    const driver = await Driver.findById(decoded.id);
    if (!driver) return res.status(401).json({ message: 'سائق غير موجود' });

    req.driver = driver;
    next();
  } catch (err) {
    res.status(401).json({ message: 'توكن غير صالح' });
  }
};
