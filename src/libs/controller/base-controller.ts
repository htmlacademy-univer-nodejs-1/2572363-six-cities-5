import { injectable } from 'inversify';
import { Router, Response, Request, NextFunction } from 'express';
import asyncHandler from 'express-async-handler';
import { StatusCodes } from 'http-status-codes';
import { Controller } from './controller.interface.js';
import { Logger } from '../../core/logger/logger.interface.js';

@injectable()
export abstract class BaseController implements Controller {
  private readonly _router: Router;
  protected readonly logger: Logger;

  constructor(logger: Logger) {
    this.logger = logger;
    this._router = Router();
  }

  get router(): Router {
    return this._router;
  }

  protected addRoute(
    path: string,
    method: 'get' | 'post' | 'put' | 'delete',
    handler: (req: Request, res: Response, next: NextFunction) => void
  ): void {
    this._router[method](path, asyncHandler(handler.bind(this)));
    this.logger.info(`Route registered: ${method.toUpperCase()} ${path}`);
  }

  protected send<T>(res: Response, statusCode: number, data: T): void {
    res.type('application/json').status(statusCode).json(data);
  }

  protected ok<T>(res: Response, data: T): void {
    this.send(res, StatusCodes.OK, data);
  }

  protected created<T>(res: Response, data: T): void {
    this.send(res, StatusCodes.CREATED, data);
  }

  protected noContent(res: Response): void {
    res.status(StatusCodes.NO_CONTENT).send();
  }

  protected badRequest(res: Response, message?: string): void {
    res.status(StatusCodes.BAD_REQUEST).json({ error: message || 'Bad Request' });
  }

  protected unauthorized(res: Response, message?: string): void {
    res.status(StatusCodes.UNAUTHORIZED).json({ error: message || 'Unauthorized' });
  }

  protected forbidden(res: Response, message?: string): void {
    res.status(StatusCodes.FORBIDDEN).json({ error: message || 'Forbidden' });
  }

  protected notFound(res: Response, message?: string): void {
    res.status(StatusCodes.NOT_FOUND).json({ error: message || 'Not Found' });
  }

  protected conflict(res: Response, message?: string): void {
    res.status(StatusCodes.CONFLICT).json({ error: message || 'Conflict' });
  }
}
