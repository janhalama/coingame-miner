import { Transaction } from './Transaction';

export class Block {
  public Timestamp: Date;
  public Difficulty: number;
  public Nonce: number;
  public Miner: string;
  public Transactions: Transaction[];
  constructor(timestamp: Date, difficulty: number, nonce: number, miner: string, transactions: Transaction[]) {
    this.Timestamp = timestamp;
    this.Difficulty = difficulty;
    this.Nonce = nonce;
    this.Miner = miner;
    this.Transactions = transactions;
  }
}
