import { Container } from 'inversify';
import { Component } from '../../types/component.enum.js';
import { Logger } from '../logger/logger.interface.js';
import { PinoLoggerService } from '../logger/pino.logger.js';
import { Config } from '../config/config.interface.js';
import { RestConfig } from '../config/rest.config.js';
import { RestSchema } from '../config/rest.schema.js';
import { RestApplication } from '../application/rest.application.js';
import { DatabaseClient } from '../database-client/database-client.interface.js';
import { MongoDatabaseClient } from '../database-client/mongo.database-client.js';
import { UserService } from '../../models/user/user-service.interface.js';
import { DefaultUserService } from '../../models/user/default-user.service.js';
import { OfferService } from '../../models/offer/offer-service.interface.js';
import { DefaultOfferService } from '../../models/offer/default-offer.service.js';
import { CommentService } from '../../models/comment/comment-service.interface.js';
import { DefaultCommentService } from '../../models/comment/default-comment.service.js';
import { types } from '@typegoose/typegoose';
import { UserModel, UserEntity } from '../../models/user/user.entity.js';
import { OfferModel, OfferEntity } from '../../models/offer/offer.entity.js';
import { CommentModel, CommentEntity } from '../../models/comment/comment.entity.js';
import { ExceptionFilter } from '../../libs/exception-filter/exception-filter.interface.js';
import { AppExceptionFilter } from '../../libs/exception-filter/app.exception-filter.js';
import { UserController } from '../../libs/controller/user.controller.js';
import { OfferController } from '../../libs/controller/offer.controller.js';
import { CommentController } from '../../libs/controller/comment.controller.js';
import { AuthService } from '../../lib/auth/auth-service.interface.js';
import { DefaultAuthService } from '../../lib/auth/default-auth.service.js';
import { AuthExceptionFilter } from '../../lib/auth/auth.exception-filter.js';

export function createRestApplicationContainer() {
  const restApplicationContainer = new Container();

  restApplicationContainer.bind<RestApplication>(Component.Application).to(RestApplication).inSingletonScope();
  restApplicationContainer.bind<Logger>(Component.Logger).to(PinoLoggerService).inSingletonScope();
  restApplicationContainer.bind<Config<RestSchema>>(Component.Config).to(RestConfig).inSingletonScope();
  restApplicationContainer.bind<DatabaseClient>(Component.DatabaseClient).to(MongoDatabaseClient).inSingletonScope();
  restApplicationContainer.bind<ExceptionFilter>(Component.ExceptionFilter).to(AppExceptionFilter).inSingletonScope();
  restApplicationContainer.bind<ExceptionFilter>(Component.AuthExceptionFilter).to(AuthExceptionFilter).inSingletonScope();

  restApplicationContainer.bind<UserService>(Component.UserService).to(DefaultUserService);
  restApplicationContainer.bind<OfferService>(Component.OfferService).to(DefaultOfferService);
  restApplicationContainer.bind<CommentService>(Component.CommentService).to(DefaultCommentService);
  restApplicationContainer.bind<AuthService>(Component.AuthService).to(DefaultAuthService);

  restApplicationContainer.bind<UserController>(Component.UserController).to(UserController);
  restApplicationContainer.bind<OfferController>(Component.OfferController).to(OfferController);
  restApplicationContainer.bind<CommentController>(Component.CommentController).to(CommentController);

  restApplicationContainer.bind<types.ModelType<UserEntity>>(Component.UserModel).toConstantValue(UserModel);
  restApplicationContainer.bind<types.ModelType<OfferEntity>>(Component.OfferModel).toConstantValue(OfferModel);
  restApplicationContainer.bind<types.ModelType<CommentEntity>>(Component.CommentModel).toConstantValue(CommentModel);

  return restApplicationContainer;
}
