import chalk from 'chalk';

export class Output {
  public info(message: string, ...args: unknown[]): void {
    // eslint-disable-next-line no-console
    console.log(message, ...args);
  }
  public error(message: string, ...args: unknown[]): void {
    // eslint-disable-next-line no-console
    console.log(chalk.red(message), ...args);
  }
  public success(message: string, ...args: unknown[]): void {
    // eslint-disable-next-line no-console
    console.log(chalk.green(message), ...args);
  }
}
