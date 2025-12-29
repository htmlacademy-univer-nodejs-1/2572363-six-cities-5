import { Middleware } from './middleware.interface.js';
import { Request, Response, NextFunction } from 'express';
import { StatusCodes } from 'http-status-codes';
import { HttpError } from '../../errors/http-error.js';

export interface DocumentExistsInterface {
  exists(documentId: string): Promise<boolean>;
}

export class DocumentExistsMiddleware implements Middleware {
  constructor(
    private readonly service: DocumentExistsInterface,
    private readonly paramName: string
  ) {}

  public async execute(req: Request, _res: Response, next: NextFunction): Promise<void> {
    const documentId = req.params[this.paramName];
    const exists = await this.service.exists(documentId);

    if (!exists) {
      throw new HttpError(
        StatusCodes.NOT_FOUND,
        `${this.paramName} with id «${documentId}» not found`,
        'DocumentExistsMiddleware'
      );
    }

    next();
  }
}
