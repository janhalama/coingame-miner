import { Transaction } from './models/Transaction';

export class TransactionPool {
  private pool: { [key: string]: Transaction } = {};
  public addAll(transactions: Transaction[]): void {
    this.pool = {};
    transactions.forEach((transaction) => {
      this.add(transaction);
    });
  }
  public add(transaction: Transaction): void {
    if (!transaction.Id) {
      throw new Error('Transactions without ids can not be stored in pool');
    }
    this.pool[transaction.Id.toString()] = transaction;
  }
  public remove(transactionId: BigInt): void {
    delete this.pool[transactionId.toString()];
  }
  public getLatestTransactionsUpToMaxFee(maxFee: number): Transaction[] {
    const result: Transaction[] = [];
    let transactions = Object.values(this.pool);
    transactions = transactions.filter((transaction) => {
      return !transaction.ValidTo || transaction.ValidTo > new Date(Date.now());
    });
    transactions = transactions.sort(compareTransactions);
    let fee = 0;
    transactions.map((transaction) => {
      if (transaction.ValidTo && transaction.ValidTo > new Date(Date.now()) && fee + transaction.Fee <= maxFee) {
        result.push(transaction);
        fee += transaction.Fee;
      }
    });

    return result;
  }
}

function compareTransactions(a: Transaction, b: Transaction): number {
  if (!a.ValidTo && !b.ValidTo) {
    return 0;
  }
  if (!a.ValidTo) {
    return -1;
  }
  if (!b.ValidTo) {
    return 1;
  }
  if (a.ValidTo < b.ValidTo) {
    return 1;
  } else {
    if (a.ValidTo > b.ValidTo) {
      return -1;
    } else {
      return 0;
    }
  }
}
