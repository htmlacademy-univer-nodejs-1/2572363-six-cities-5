import chalk from 'chalk';
import { TSVFileReader } from '../../shared/libs/file-reader/tsv-file-reader.js';
import { getErrorMessage } from '../../shared/helpers/common.js';
import { parseTSVLine } from '../../shared/helpers/offer.js';
import { DefaultUserService } from '../../models/user/default-user.service.js';
import { PinoLoggerService } from '../../core/logger/pino.logger.js';
import { MongoDatabaseClient } from '../../core/database-client/index.js';
import { getMongoURI } from '../../shared/utils/index.js';
import { DefaultOfferService } from '../../models/offer/default-offer.service.js';
import { Command } from '../command.interface.js';
import { Component } from '../../types/component.enum.js';
import { createRestApplicationContainer } from '../../core/container/rest.container.js';

export class ImportCommand implements Command {
  private processedCount = 0;
  private logger = new PinoLoggerService();
  private isConnected = false;
  private salt = '';
  private databaseClient?: MongoDatabaseClient;
  private userService?: DefaultUserService;
  private offerService?: DefaultOfferService;
  private fileReader = new TSVFileReader();

  private handleLine = async (line: string, resolve: () => void) => {
    const trimmedLine = line.trim();
    if (trimmedLine && !trimmedLine.startsWith('title\t')) {
      try {
        await this.storeOfferInDatabase(trimmedLine);
      } catch (err) {
        this.logger.error(`Line processing error: ${getErrorMessage(err)}`);
      }
    }
    resolve();
  };

  private handleCompletion = () => {
    this.logger.info(`Import finished. Total processed: ${this.processedCount}`);
    this.processedCount = 0;
  };

  private async establishDatabaseConnection(dbUser: string, dbPassword: string, dbHost: string, dbPort: string, dbName: string): Promise<void> {
    const connectionString = getMongoURI(dbUser, dbPassword, dbHost, dbPort, dbName);
    this.databaseClient = new MongoDatabaseClient(this.logger);
    await this.databaseClient.connect(connectionString);
    this.isConnected = true;

    const container = createRestApplicationContainer();
    this.userService = container.get<DefaultUserService>(Component.UserService);
    this.offerService = container.get<DefaultOfferService>(Component.OfferService);
  }

  private async closeDatabaseConnection(): Promise<void> {
    if (this.isConnected && this.databaseClient) {
      await this.databaseClient.disconnect();
      this.isConnected = false;
      this.logger.info('Disconnected from database');
    }
  }

  private async storeOfferInDatabase(line: string): Promise<void> {
    if (!this.isConnected) {
      this.processedCount++;
      return;
    }

    try {
      const { userDto, offerDto } = parseTSVLine(line);
      const userRecord = await this.userService!.findOrCreate(userDto, this.salt);
      const offerData = {
        ...offerDto,
        author: userRecord.id.toString()
      };
      await this.offerService!.create(offerData);
      this.processedCount++;

      if (this.processedCount % 100 === 0) {
        this.logger.info(`Processed ${this.processedCount} offers`);
      }
    } catch (err) {
      const errorMessage = getErrorMessage(err);
      this.logger.error(`Failed to store offer: ${errorMessage}`);
      throw err;
    }
  }

  getName(): string {
    return '--import';
  }

  async execute(...parameters: string[]): Promise<void> {
    const [filename, dbUser, dbPassword, dbHost, dbPort, dbName, salt] = parameters;

    if (!filename) {
      console.error(chalk.red('Filename is required'));
      return;
    }

    if (!dbUser || !dbPassword || !dbHost || !dbPort || !dbName || !salt) {
      console.error(chalk.red('Database parameters are incomplete'));
      console.error(chalk.red('Usage: --import <file> <user> <password> <host> <port> <db> <salt>'));
      return;
    }

    try {
      this.salt = salt;
      this.logger.info(`Starting import from ${filename}`);
      this.logger.info(`Connecting to ${dbHost}:${dbPort}/${dbName}`);

      await this.establishDatabaseConnection(dbUser, dbPassword, dbHost, dbPort, dbName);

      this.fileReader.on('line', this.handleLine);
      this.fileReader.on('end', this.handleCompletion);

      await this.fileReader.read(filename);
      this.logger.info('Import completed successfully');
    } catch (error) {
      console.error(chalk.red(`Import failed: ${getErrorMessage(error)}`));
    } finally {
      await this.closeDatabaseConnection();
    }
  }
}
