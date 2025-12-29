import { inject, injectable } from 'inversify';
import { NextFunction, Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { ExceptionFilter } from './exception-filter.interface.js';
import { Logger } from '../../core/logger/logger.interface.js';
import { Component } from '../../types/component.enum.js';
import { HttpError } from '../../errors/http-error.js';

@injectable()
export class AppExceptionFilter implements ExceptionFilter {
  constructor(
    @inject(Component.Logger) private readonly logger: Logger
  ) {
    this.logger.info('Register AppExceptionFilter');
  }

  private handleHttpError(error: HttpError, _req: Request, res: Response): void {
    this.logger.error(`[${error.detail}]: ${error.httpStatusCode} — ${error.message}`);
    res.status(error.httpStatusCode).json({
      type: 'HttpError',
      error: error.message,
      details: error.detail
    });
  }

  private handleOtherError(error: Error, _req: Request, res: Response): void {
    this.logger.error(error.message);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      type: 'Error',
      error: error.message,
    });
  }

  public catch(error: Error | HttpError, req: Request, res: Response, _next: NextFunction): void {
    if (error instanceof HttpError) {
      return this.handleHttpError(error, req, res);
    }

    this.handleOtherError(error, req, res);
  }
}
