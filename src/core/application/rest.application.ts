import { inject, injectable } from 'inversify';
import { Logger } from '../logger/logger.interface.js';
import { Config } from '../config/config.interface.js';
import { RestSchema } from '../config/rest.schema.js';
import { Component } from '../../types/component.enum.js';
import {DatabaseClient} from '../database-client';
import {getMongoURI} from '../../shared/utils/index.js';

@injectable()
export class RestApplication {
  constructor(
    @inject(Component.Logger) private readonly logger: Logger,
    @inject(Component.Config) private readonly config: Config<RestSchema>,
    @inject(Component.DatabaseClient) private readonly databaseClient: DatabaseClient,
  ) {}

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

  public async init() {
    this.logger.info('Application initialization');
    this.logger.info(`Get value from env $PORT: ${this.config.get('PORT')}`);

    this.logger.info('Init database...');
    await this._initDatabase();
    this.logger.info('Init database completed');
  }
}
