import * as express from 'express';

declare global {
  namespace Express {
    interface Request {
      // إذا انت تضيف Firebase UID أو أي user object
      user?: { id: string; /* أو ما يناسبك من الحقول */ };

      // params عامّة (إذا لم تكتب generic في الراوتر)
      params: Record<string, string>;
    }
  }
}

// أيضاً لو احتجت تحويل Number كدالّة (نادر)
declare function Number(value: any): number;
