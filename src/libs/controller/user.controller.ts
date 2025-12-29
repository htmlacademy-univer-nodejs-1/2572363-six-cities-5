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
import { ValidateObjectIdMiddleware } from '../middleware/validate-object-id.middleware.js';
import { UploadFileMiddleware } from '../middleware/upload-file.middleware.js';
import { AuthService } from '../../lib/auth/auth-service.interface.js';
import { PrivateRouteMiddleware } from '../../lib/auth/private-route.middleware.js';

@injectable()
export class UserController extends BaseController {
  constructor(
    @inject(Component.Logger) protected readonly logger: Logger,
    @inject(Component.UserService) private readonly userService: UserService,
    @inject(Component.Config) private readonly config: Config<RestSchema>,
    @inject(Component.AuthService) private readonly authService: AuthService,
  ) {
    super(logger);
    this.logger.info('Register routes for UserController...');

    this.addRoute('/users/register', 'post', this.create, [
      new ValidateDtoMiddleware(CreateUserDto)
    ]);

    this.addRoute('/users/login', 'post', this.login, [
      new ValidateDtoMiddleware(LoginUserDto)
    ]);

    this.addRoute('/users/login', 'get', this.check, [
      new PrivateRouteMiddleware()
    ]);

    this.addRoute('/users/:userId/avatar', 'post', this.uploadAvatar, [
      new ValidateObjectIdMiddleware('userId'),
      new PrivateRouteMiddleware(),
      new UploadFileMiddleware(this.config.get('UPLOAD_DIRECTORY'), 'avatar')
    ]);
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
    const user = await this.authService.verify(body);
    const token = await this.authService.authenticate(user);

    const transformedUser = transformEntityForResponse(user);
    const userData = fillDTO(UserRdo, transformedUser);
    this.ok(res, {
      token,
      user: userData
    });
  }

  public async check(
    req: Request,
    res: Response,
  ): Promise<void> {
    if (!req.tokenPayload) {
      throw new HttpError(
        StatusCodes.UNAUTHORIZED,
        'Unauthorized',
        'UserController'
      );
    }

    const user = await this.userService.findByEmail(req.tokenPayload.email);
    if (!user) {
      throw new HttpError(
        StatusCodes.UNAUTHORIZED,
        'User not found',
        'UserController'
      );
    }

    const transformedUser = transformEntityForResponse(user);
    const userData = fillDTO(UserRdo, transformedUser);
    this.ok(res, userData);
  }

  public async uploadAvatar(
    req: Request,
    res: Response,
  ): Promise<void> {
    const { userId } = req.params;

    if (!req.file) {
      throw new HttpError(
        StatusCodes.BAD_REQUEST,
        'No avatar file uploaded',
        'UserController'
      );
    }

    const uploadDirectory = this.config.get('UPLOAD_DIRECTORY');
    const uploadPath = uploadDirectory.startsWith('./') ? uploadDirectory.substring(2) : uploadDirectory;
    const avatarPath = `/${uploadPath}/${req.file.filename}`;

    const updatedUser = await this.userService.updateById(userId, { avatar: avatarPath });

    if (!updatedUser) {
      throw new HttpError(
        StatusCodes.NOT_FOUND,
        `User with id ${userId} not found`,
        'UserController'
      );
    }

    const transformedUser = transformEntityForResponse(updatedUser);
    const userData = fillDTO(UserRdo, transformedUser);
    this.ok(res, userData);
  }
}
