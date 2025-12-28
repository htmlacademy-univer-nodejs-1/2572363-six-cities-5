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
import { types } from '@typegoose/typegoose';
import { UserModel, UserEntity } from '../../models/user/user.entity.js';
import { OfferModel, OfferEntity } from '../../models/offer/offer.entity.js';

export function createRestApplicationContainer() {
  const restApplicationContainer = new Container();

  restApplicationContainer.bind<RestApplication>(Component.Application).to(RestApplication).inSingletonScope();
  restApplicationContainer.bind<Logger>(Component.Logger).to(PinoLoggerService).inSingletonScope();
  restApplicationContainer.bind<Config<RestSchema>>(Component.Config).to(RestConfig).inSingletonScope();
  restApplicationContainer.bind<DatabaseClient>(Component.DatabaseClient).to(MongoDatabaseClient).inSingletonScope();

  restApplicationContainer.bind<UserService>(Component.UserService).to(DefaultUserService);
  restApplicationContainer.bind<OfferService>(Component.OfferService).to(DefaultOfferService);

  restApplicationContainer.bind<types.ModelType<UserEntity>>(Component.UserModel).toConstantValue(UserModel);
  restApplicationContainer.bind<types.ModelType<OfferEntity>>(Component.OfferModel).toConstantValue(OfferModel);

  return restApplicationContainer;
}
