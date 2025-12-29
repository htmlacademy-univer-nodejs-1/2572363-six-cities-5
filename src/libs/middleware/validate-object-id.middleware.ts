import { Middleware } from './middleware.interface.js';
import { Request, Response, NextFunction } from 'express';
import { Types } from 'mongoose';
import { StatusCodes } from 'http-status-codes';
import { HttpError } from '../../errors/http-error.js';

export class ValidateObjectIdMiddleware implements Middleware {
  constructor(private param: string) {}

  public execute(req: Request, _res: Response, next: NextFunction): void {
    const objectId = req.params[this.param];

    if (!Types.ObjectId.isValid(objectId)) {
      throw new HttpError(
        StatusCodes.BAD_REQUEST,
        `Invalid ObjectID: ${objectId}`,
        'ValidateObjectIdMiddleware'
      );
    }

    next();
  }
}
