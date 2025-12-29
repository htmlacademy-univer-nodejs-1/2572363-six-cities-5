import { Middleware } from '../../libs/middleware/middleware.interface.js';
import { Request, Response, NextFunction } from 'express';
import { HttpError } from '../../errors/http-error.js';
import { StatusCodes } from 'http-status-codes';

export class PrivateRouteMiddleware implements Middleware {
  public async execute(req: Request, _res: Response, next: NextFunction): Promise<void> {
    if (!req.tokenPayload) {
      throw new HttpError(
        StatusCodes.UNAUTHORIZED,
        'Unauthorized',
        'PrivateRouteMiddleware'
      );
    }

    next();
  }
}
