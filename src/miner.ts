import { Output } from './output';
import { Config } from '.';
import { ApiClient } from './apiClient';
import crypto from 'crypto';
import { Transaction } from './models/Transaction';
import { serializeHashToYaml } from './serialization/serializeHashToYaml';
import { Hash } from './models/Hash';
import { serializeBlockToYaml } from './serialization/serializeBlockToYaml';
import { TransactionPool } from './transactionPool';
import { AmpqConsumer } from './ampqConsumer';
import { Block } from './models/Block';

export class Miner {
  private output: Output;
  private config: Config;
  private apiClient: ApiClient;
  private transactionPool: TransactionPool;
  private amqpConsumer: AmpqConsumer;
  constructor(
    config: Config,
    output: Output,
    apiClient: ApiClient,
    transactionPool: TransactionPool,
    amqpConsumer: AmpqConsumer) {
    this.output = output;
    this.config = config;
    this.apiClient = apiClient;
    this.transactionPool = transactionPool;
    this.amqpConsumer = amqpConsumer;
  }
  public async startMining(): Promise<void> {
    try {
      this.output.success(`${this.config.minerName} started mining...`);
      this.transactionPool.addAll(await this.apiClient.getTransactionPool());
      await this.amqpConsumer.connect();
      //eslint-disable-next-line no-loops/no-loops
      for (let blockAttempt = 0; ; blockAttempt++) {
        const blockChain = await this.apiClient.getBlockChain();
        const state = await this.apiClient.getState();
        const latestTransactions = this.transactionPool.getLatestTransactionsUpToMaxFee(state.Fee);
        const timeStamp = new Date(Date.now());
        const currentHashYaml = serializeHashToYaml(<Hash>blockChain[blockChain.length - 1]);
        const requiredDifficulty = state.Difficulty;
        if (latestTransactions.length === 0) {
          this.output.error('No transactions in pool!');
          break;
        }
        const oldestTransactionTimestamp = latestTransactions[latestTransactions.length - 1].ValidTo;
        this.output.info(`Mining block attempt #${blockAttempt + 1} oldest transaction timestamp${oldestTransactionTimestamp?.toISOString()} new block timeStamp ${timeStamp.toISOString()} id ${latestTransactions[latestTransactions.length - 1].Id}`);
        //eslint-disable-next-line no-loops/no-loops
        for (let i = 0; i < 100000000; i++) {
          if (!oldestTransactionTimestamp || oldestTransactionTimestamp < new Date(Date.now())) {
            break;
          }
          const lastReceivedBlock = this.amqpConsumer.getLastBlock();
          const lastBlockChainBlock = (<Block>blockChain[blockChain.length - 2]);
          if (lastReceivedBlock && (lastReceivedBlock.Timestamp.toUTCString() !== lastBlockChainBlock.Timestamp.toUTCString())) {
            this.output.info('BlockChain change detected', lastReceivedBlock, lastBlockChainBlock);
            break;
          }
          const newBlock = this.createNewBlock(timeStamp, requiredDifficulty, i, state.Fee, latestTransactions);
          const newBlockYaml = serializeBlockToYaml(newBlock);
          const newDigestHex = this.computeDigest(currentHashYaml, newBlockYaml);
          const newDigestPrefix = BigInt('0x' + newDigestHex.slice(0, 8));
          const newDigestPrefixBits = newDigestPrefix.toString(2).padStart(32, '0');
          const newDigestDifficulty = newDigestPrefixBits.indexOf('1');
          if (newDigestDifficulty > 15) {
            this.output.info('Hash', requiredDifficulty, newDigestDifficulty, newDigestPrefixBits, newDigestHex, i);
          }
          if (newDigestDifficulty >= requiredDifficulty) {
            const uploadNewBlockYaml = currentHashYaml + newBlockYaml;
            try {
              await this.apiClient.uploadNewBlock(uploadNewBlockYaml);
            } catch (error) {
              this.output.error(error.message);
            }
            break;
          }
        }
      }
    } catch (e) {
      this.output.error('Fatal error', e.message);
      process.exitCode = 1;
    }
  }
  private createNewBlock(timeStamp: Date, difficulty: number, nonce: number, fee: number, transactions: Transaction[]): Block {
    const newBlock = {
      Timestamp: timeStamp,
      Difficulty: difficulty,
      Nonce: nonce,
      Miner: this.config.minerName,
      Transactions: [
        new Transaction(fee),
      ]
    };
    transactions.forEach((trasaction) => {
      newBlock.Transactions.push(trasaction);
    });
    return newBlock;
  }
  private computeDigest(currentHashYaml: string, newBlockYaml: string): string {
    const hash = crypto.createHash('sha384');
    hash.update(currentHashYaml, 'utf8');
    hash.update(newBlockYaml, 'utf8');
    hash.update(currentHashYaml, 'utf8');
    const data = hash.update(newBlockYaml, 'utf8');
    return data.digest('hex');
  }
}