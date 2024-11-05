import * as express from 'express';

declare global {
  namespace Express {
    interface Request {
      user?: {
        userId: string;
        role: string;
        email: string;
        walletId: string;
        iat: number;
        exp: number;
      };
    }
  }
}
