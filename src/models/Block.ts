import { Transaction } from './Transaction';

export class Block {
  constructor(Timestamp: Date, Difficulty: number, Nonce: number, Miner: string, Transactions: Transaction[]) {
    this.Timestamp = Timestamp;
    this.Difficulty = Difficulty;
    this.Nonce = Nonce;
    this.Miner = Miner;
    this.Transactions = Transactions;
  }
  public Timestamp: Date;
  public Difficulty: number;
  public Nonce: number;
  public Miner: string;
  public Transactions: Transaction[];
}