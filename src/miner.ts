import { AmpqConsumer } from './ampqConsumer';
import { ApiClient } from './apiClient';
import { computeDigest } from './computeDigest';
import { Block } from './models/Block';
import { Hash } from './models/Hash';
import { Transaction } from './models/Transaction';
import { Output } from './output';
import { serializeBlockToYaml } from './serialization/serializeBlockToYaml';
import { serializeHashToYaml } from './serialization/serializeHashToYaml';
import { TransactionPool } from './transactionPool';
import { Config } from '.';

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
    amqpConsumer: AmpqConsumer,
  ) {
    this.output = output;
    this.config = config;
    this.apiClient = apiClient;
    this.transactionPool = transactionPool;
    this.amqpConsumer = amqpConsumer;
  }
  public async startMining(): Promise<void> {
    try {
      this.output.success(`${this.config.minerName} started mining...`);
      await this.amqpConsumer.connect();
      for (let blockAttempt = 0; ; blockAttempt++) {
        this.transactionPool.addAll(await this.apiClient.getTransactionPool());
        const blockChain = await this.apiClient.getBlockChain();
        const state = await this.apiClient.getState();
        const latestTransactions = this.transactionPool.getLatestTransactionsUpToMaxFee(state.Fee);
        const timeStamp = new Date(Date.now());
        const currentHashYaml = serializeHashToYaml(<Hash>blockChain[blockChain.length - 1]);
        const requiredDifficulty = state.Difficulty;
        if (latestTransactions.length < 5) {
          this.output.error('Not enough transaction in pool!', latestTransactions.length);
          await new Promise((resolve) => setTimeout(resolve, 1000));
          continue;
        }
        const oldestTransactionTimestamp = latestTransactions[latestTransactions.length - 1].ValidTo;
        this.output.info(
          `Mining block attempt #${
            blockAttempt + 1
          } oldest transaction timestamp${oldestTransactionTimestamp?.toISOString()} new block timeStamp ${timeStamp.toISOString()} transactions count ${
            latestTransactions.length + 1
          }`,
        );
        for (let i = 0; i < 100000000; i++) {
          if (!oldestTransactionTimestamp || oldestTransactionTimestamp < new Date(Date.now())) {
            break;
          }
          const lastReceivedBlock = this.amqpConsumer.getLastBlock();
          const lastBlockChainBlock = <Block>blockChain[blockChain.length - 2];
          if (
            lastReceivedBlock &&
            lastReceivedBlock.Timestamp.toUTCString() !== lastBlockChainBlock.Timestamp.toUTCString()
          ) {
            this.output.info('BlockChain change detected', lastReceivedBlock, lastBlockChainBlock);
            break;
          }
          const newBlock = this.createNewBlock(timeStamp, requiredDifficulty, i, state.Fee, latestTransactions);
          const newBlockYaml = serializeBlockToYaml(newBlock);
          const newDigestHex = computeDigest(currentHashYaml, newBlockYaml);
          const newDigestPrefix = BigInt(`0x${newDigestHex.slice(0, 8)}`);
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
  private createNewBlock(
    timeStamp: Date,
    difficulty: number,
    nonce: number,
    fee: number,
    transactions: Transaction[],
  ): Block {
    const newBlock = {
      Timestamp: timeStamp,
      Difficulty: difficulty,
      Nonce: nonce,
      Miner: this.config.minerName,
      Transactions: [new Transaction(fee)],
    };
    transactions.forEach((trasaction) => {
      newBlock.Transactions.push(trasaction);
    });

    return newBlock;
  }
}
