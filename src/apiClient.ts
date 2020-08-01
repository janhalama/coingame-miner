import { Output } from './output';
import axios, { AxiosInstance } from 'axios'
import yaml from 'js-yaml';
import { Transaction } from './models/Transaction';
import { Block } from './models/Block';
import { State } from './models/State';
import { Hash } from './models/Hash';
import { coinGameSchema } from './schema/CoinGameSchema';
import { deserializeTransactions } from './deserialization/deserializeTransactions';

export class ApiClient {
  private output: Output;
  private axiosInstance: AxiosInstance;
  constructor(apiBaseUrl: string, output: Output) {
    this.output = output;
    this.axiosInstance = axios.create({
      baseURL: apiBaseUrl,
    });

  }
  public async getBlockChain(): Promise<(Block | Hash)[]> {
    const response = await this.axiosInstance.get('/coingame');
    const documents = yaml.loadAll(response.data, null, {
      schema: coinGameSchema
    });
    return documents;
  }
  public async getTransactionPool(): Promise<Transaction[]> {
    const response = await this.axiosInstance.get('/coingame/txpool');
    return deserializeTransactions(response.data);
  }
  public async getState(): Promise<State> {
    const response = await this.axiosInstance.get('/coingame/state');
    return response.data;
  }
  public async uploadNewBlock(yamlData: string,): Promise<void> {
    try {
      await this.axiosInstance.put('/coingame', yamlData, {
        headers: {
          'Content-Type': 'text/vnd.yaml',
        }
      });
      this.output.success('Mining success - new block added to blockchain');
    }
    catch (error) {
      this.output.info('uploadNewBlock - error', error.response.code, error.response.data);
      throw new Error(`Mining error - new block has not been accepted. Reason: ${error?.response?.data?.message}`);
    }
  }
}