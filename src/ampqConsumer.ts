
import * as ampq from 'amqplib';
import { ConsumeMessage } from 'amqplib';
import { Output } from './output';
import { TransactionPool } from './transactionPool';
import { deserializeTransactions } from './deserialization/deserializeTransactions';
import yaml from 'js-yaml';
import { coinGameSchema } from './schema/CoinGameSchema';
import { Block } from './models/Block';

export interface AmpqConsumerConfig {
  amqpUrl: string;
  queueName: string;
}

export class AmpqConsumer {
  private output: Output;
  private config: AmpqConsumerConfig;
  private transactionPool: TransactionPool;
  private lastBlock?: Block;
  constructor(output: Output, config: AmpqConsumerConfig, transactionPool: TransactionPool) {
    this.output = output;
    this.config = config;
    this.transactionPool = transactionPool;
  }
  public async connect(): Promise<void> {
    const queueNameWithPrefix = `~T${this.config.queueName}`;
    const connection = await ampq.connect(this.config.amqpUrl);
    const channel = await connection.createChannel();
    await channel.assertQueue(queueNameWithPrefix, {
      autoDelete: true,
      exclusive: true,
    });
    await channel.bindQueue(queueNameWithPrefix, 'amq.topic', '#');
    channel.consume(queueNameWithPrefix, this.onMessage.bind(this));
    this.output.success('Listening RabbitMQ messages...');
  }
  public getLastBlock(): Block | undefined {
    return this.lastBlock;
  }
  private onMessage(msg: ConsumeMessage | null) {
    if (msg) {
      let transactions;
      let block;
      switch (msg.fields.routingKey) {
        case 'transaction.removed':
          transactions = deserializeTransactions(msg.content.toString('utf8'));
          if (transactions[0]?.Id) {
            this.transactionPool.remove(transactions[0].Id)
          }
          break;
        case 'transaction.added':
          transactions = deserializeTransactions(msg.content.toString('utf8'));
          this.transactionPool.addAll(transactions);
          break;
        case 'block.added':
          block = <Block>yaml.load(msg.content.toString('utf8'), {
            schema: coinGameSchema
          });
          this.output.info(`New block added to blockchain by ${block?.Miner} at ${block?.Timestamp}`);
          this.lastBlock = block;
          break;
        default:
          this.output.info('Unsupported message routing key received', msg.fields.routingKey);
          break;
      }
    }
  }

}