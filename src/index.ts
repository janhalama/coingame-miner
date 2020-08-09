import { v4 as uuidv4 } from 'uuid';
import { AmpqConsumer, AmpqConsumerConfig } from './ampqConsumer';
import { ApiClient } from './apiClient';
import { Miner } from './miner';
import { Output } from './output';
import { TransactionPool } from './transactionPool';

export interface Config {
  apiUrl: string;
  ampqConsumerConfig: AmpqConsumerConfig;
  minerName: string;
}
const minerName = process.argv[2] || 'John';
const config: Config = {
  apiUrl: 'http://localhost/api',
  ampqConsumerConfig: {
    amqpUrl: 'amqp://coingameminer:guest@localhost:5672',
    queueName: `${minerName}sQueue-${uuidv4()}`,
  },
  minerName: minerName,
};

const output: Output = new Output();
const transactionPool = new TransactionPool();
const ampqConsumer = new AmpqConsumer(output, config.ampqConsumerConfig, transactionPool);
const apiClient = new ApiClient(config.apiUrl, output);

const miner = new Miner(config, output, apiClient, transactionPool, ampqConsumer);
miner.startMining();
