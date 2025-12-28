import { CommandParser } from './command-parser.js';
import { Command } from './command.interface.js';

export class CLIApplication {
  private commands: Record<string, Command> = {};

  constructor(private readonly defaultCommand: string = '--help') {}

  registerCommands(commandList: Command[]): void {
    commandList.forEach((command) => {
      const commandName = command.getName();
      if (this.commands[commandName]) {
        throw new Error(`Command ${commandName} is already registered`);
      }
      this.commands[commandName] = command;
    });
  }

  getCommand(commandName: string): Command {
    return this.commands[commandName] ?? this.getDefaultCommand();
  }

  getDefaultCommand(): Command {
    if (!this.commands[this.defaultCommand]) {
      throw new Error(`The default command (${this.defaultCommand}) is not registered.`);
    }
    return this.commands[this.defaultCommand];
  }

  processCommand(argv: string[]): void {
    const parsedCommand = CommandParser.parse(argv);

    if (Object.keys(parsedCommand).length === 0) {
      this.getDefaultCommand().execute();
      return;
    }

    for (const [commandName, parameters] of Object.entries(parsedCommand)) {
      const command = this.getCommand(commandName);
      command.execute(...parameters);
    }
  }
}
