import axios from 'axios';
import chalk from 'chalk';
import { TSVOfferGenerator } from '../../shared/libs/offer-generator/tsv-offer-generator.js';
import { TSVFileWriter } from '../../shared/libs/file-writer/tsv-file-writer.js';
import { Command } from '../command.interface.js';

export class GenerateCommand implements Command {
  private initialData: any;

  private async load(url: string): Promise<any> {
    try {
      const response = await axios.get(url);
      const data = response.data[0];
      if (!data) {
        throw new Error('No data received from server');
      }
      return data;
    } catch (error) {
      throw new Error(`Cannot load data from ${url}`);
    }
  }

  private async write(filepath: string, offerCount: number): Promise<void> {
    if (!this.initialData) {
      throw new Error('Initial data not loaded');
    }

    const tsvOfferGenerator = new TSVOfferGenerator(this.initialData);
    const tsvFileWriter = new TSVFileWriter(filepath);

    const header = [
      'title', 'description', 'publishedDate', 'city', 'previewImage', 'images',
      'isPremium', 'isFavorite', 'rating', 'type', 'bedrooms', 'maxAdults', 'price',
      'goods', 'author', 'commentsCount', 'latitude', 'longitude'
    ].join('\t');

    await tsvFileWriter.write(header);

    for (let i = 0; i < offerCount; i++) {
      await tsvFileWriter.write(tsvOfferGenerator.generate());
      if ((i + 1) % 100 === 0) {
        console.info(chalk.blue(`Generated ${i + 1} offers...`));
      }
    }
  }

  getName(): string {
    return '--generate';
  }

  async execute(...parameters: string[]): Promise<void> {
    const [count, filepath, url] = parameters;
    const offerCount = Number.parseInt(count, 10);

    if (isNaN(offerCount) || offerCount <= 0) {
      console.error(chalk.red('Invalid count value. Please provide a positive number.'));
      return;
    }

    if (!filepath) {
      console.error(chalk.red('Please provide filepath for generated data.'));
      return;
    }

    if (!url) {
      console.error(chalk.red('Please provide URL for mock data.'));
      return;
    }

    try {
      console.info(chalk.blue('Loading mock data...'));
      this.initialData = await this.load(url);
      console.info(chalk.blue(`Generating ${offerCount} offers...`));
      await this.write(filepath, offerCount);
      console.info(chalk.green(`File ${filepath} was successfully created with ${offerCount} offers!`));
    } catch (error) {
      console.error(chalk.red('Failed to generate data:'));
      if (error instanceof Error) {
        console.error(chalk.red(error.message));
      }
    }
  }
}
