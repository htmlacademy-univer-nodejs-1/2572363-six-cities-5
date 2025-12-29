import { inject, injectable } from 'inversify';
import { NextFunction, Request, Response } from 'express';
import { ExceptionFilter } from '../../libs/exception-filter/exception-filter.interface.js';
import { Logger } from '../../core/logger/logger.interface.js';
import { Component } from '../../types/component.enum.js';
import { UserNotFoundException } from '../../errors/auth.errors.js';
import { UserPasswordIncorrectException } from '../../errors/auth.errors.js';

@injectable()
export class AuthExceptionFilter implements ExceptionFilter {
  constructor(
    @inject(Component.Logger) private readonly logger: Logger
  ) {
    this.logger.info('Register AuthExceptionFilter');
  }

  public catch(error: Error, _req: Request, res: Response, next: NextFunction): void {
    if (error instanceof UserNotFoundException || error instanceof UserPasswordIncorrectException) {
      this.logger.error(`[Auth Error] ${error.message}`);
      res.status(error.httpStatusCode).json({
        type: error.constructor.name,
        error: error.message,
      });
      return;
    }

    next(error);
  }
}
