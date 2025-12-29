import { inject, injectable } from 'inversify';
import { Request, Response } from 'express';
import { BaseController } from './base-controller.js';
import { Logger } from '../../core/logger/logger.interface.js';
import { Component } from '../../types/component.enum.js';
import { UserService } from '../../models/user/user-service.interface.js';
import { CreateUserDto } from '../../models/user/dto/create-user.dto.js';
import { LoginUserDto } from '../../models/user/dto/login-user.dto.js';
import { Config } from '../../core/config/config.interface.js';
import { RestSchema } from '../../core/config/rest.schema.js';
import { HttpError } from '../../errors/http-error.js';
import { StatusCodes } from 'http-status-codes';
import { fillDTO, transformEntityForResponse } from '../helpers/index.js';
import { UserRdo } from '../rdo/user.rdo.js';
import { ValidateDtoMiddleware } from '../middleware/validate-dto.middleware.js';

@injectable()
export class UserController extends BaseController {
  constructor(
    @inject(Component.Logger) protected readonly logger: Logger,
    @inject(Component.UserService) private readonly userService: UserService,
    @inject(Component.Config) private readonly config: Config<RestSchema>,
  ) {
    super(logger);
    this.logger.info('Register routes for UserController...');

    this.addRoute('/users/register', 'post', this.create, [
      new ValidateDtoMiddleware(CreateUserDto)
    ]);

    this.addRoute('/users/login', 'post', this.login, [
      new ValidateDtoMiddleware(LoginUserDto)
    ]);

    this.addRoute('/users/check', 'get', this.check);
  }

  public async create(
    req: Request,
    res: Response,
  ): Promise<void> {
    const body = req.body as CreateUserDto;
    const existsUser = await this.userService.findByEmail(body.email);

    if (existsUser) {
      throw new HttpError(
        StatusCodes.CONFLICT,
        `User with email «${body.email}» already exists`,
        'UserController'
      );
    }

    const salt = this.config.get('SALT');
    const result = await this.userService.create(body, salt);

    const transformedResult = transformEntityForResponse(result);
    const userData = fillDTO(UserRdo, transformedResult);
    this.created(res, userData);
  }

  public async login(
    req: Request,
    res: Response,
  ): Promise<void> {
    const body = req.body as LoginUserDto;
    const salt = this.config.get('SALT');
    const user = await this.userService.verifyUser(body.email, body.password, salt);

    if (!user) {
      throw new HttpError(
        StatusCodes.UNAUTHORIZED,
        'Invalid email or password',
        'UserController'
      );
    }

    const transformedUser = transformEntityForResponse(user);
    const userData = fillDTO(UserRdo, transformedUser);
    this.ok(res, {
      token: 'dummy-token-for-now',
      user: userData
    });
  }

  public async check(
    _req: Request,
    res: Response,
  ): Promise<void> {
    this.unauthorized(res, 'Not implemented yet');
  }
}
