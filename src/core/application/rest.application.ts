import { inject, injectable } from 'inversify';
import express, { Express } from 'express';
import { Logger } from '../logger/logger.interface.js';
import { Config } from '../config/config.interface.js';
import { RestSchema } from '../config/rest.schema.js';
import { Component } from '../../types/component.enum.js';
import { DatabaseClient } from '../database-client/database-client.interface.js';
import { getMongoURI } from '../../shared/utils/index.js';
import { Controller } from '../../libs/controller/controller.interface.js';
import { ExceptionFilter } from '../../libs/exception-filter/exception-filter.interface.js';
import { UserController } from '../../libs/controller/user.controller.js';
import { OfferController } from '../../libs/controller/offer.controller.js';
import { CommentController } from '../../libs/controller/comment.controller.js';

@injectable()
export class RestApplication {
  private expressApplication: Express;

  constructor(
    @inject(Component.Logger) private readonly logger: Logger,
    @inject(Component.Config) private readonly config: Config<RestSchema>,
    @inject(Component.DatabaseClient) private readonly databaseClient: DatabaseClient,
    @inject(Component.ExceptionFilter) private readonly exceptionFilter: ExceptionFilter,
    @inject(Component.UserController) private readonly userController: UserController,
    @inject(Component.OfferController) private readonly offerController: OfferController,
    @inject(Component.CommentController) private readonly commentController: CommentController,
  ) {
    this.expressApplication = express();
  }

  private async _initDatabase() {
    const uri = getMongoURI(
      this.config.get('DB_USER'),
      this.config.get('DB_PASSWORD'),
      this.config.get('DB_HOST'),
      this.config.get('DB_PORT'),
      this.config.get('DB_NAME'),
    );

    return this.databaseClient.connect(uri);
  }

  private _initMiddleware() {
    this.expressApplication.use(express.json());
    const uploadDirectory = this.config.get('UPLOAD_DIRECTORY');
    this.expressApplication.use('/upload', express.static(uploadDirectory));
  }

  private _initRoutes(controllers: Controller[]) {
    for (const controller of controllers) {
      this.expressApplication.use('/', controller.router);
    }
  }

  private _initExceptionFilters() {
    this.expressApplication.use(this.exceptionFilter.catch.bind(this.exceptionFilter));
  }

  private _initServer() {
    const port = this.config.get('PORT');
    this.expressApplication.listen(port, () => {
      this.logger.info(`Server started on http://localhost:${port}`);
    });
  }

  public async init() {
    this.logger.info('Application initialization');
    this.logger.info(`Get value from env $PORT: ${this.config.get('PORT')}`);

    this.logger.info('Init database...');
    await this._initDatabase();
    this.logger.info('Init database completed');

    this.logger.info('Init middleware...');
    this._initMiddleware();
    this.logger.info('Middleware initialization completed');

    this.logger.info('Init controllers...');
    const controllers = [
      this.userController,
      this.offerController,
      this.commentController,
    ];
    this._initRoutes(controllers);
    this.logger.info('Controller initialization completed');

    this.logger.info('Init exception filters...');
    this._initExceptionFilters();
    this.logger.info('Exception filters initialization completed');

    this.logger.info('Init server...');
    this._initServer();
  }
}
