import { Command } from '../command.interface.js';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import chalk from 'chalk';

export class VersionCommand implements Command {
  private readonly filePath = './package.json';

  private readVersion(): string {
    const jsonContent = readFileSync(resolve(this.filePath), 'utf-8');
    const importedPackage = JSON.parse(jsonContent);
    return importedPackage.version;
  }

  public getName(): string {
    return '--version';
  }

  public execute(): void {
    try {
      const version = this.readVersion();
      console.info(chalk.green(version));
    } catch (error: unknown) {
      console.error(chalk.red(`Failed to read version from ${this.filePath}`));
      if (error instanceof Error) {
        console.error(chalk.red(error.message));
      }
    }
  }
}
