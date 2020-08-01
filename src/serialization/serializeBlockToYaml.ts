import { Block } from '../models/Block';
import { serializeTransactionsToYaml } from './serializeTransactionsToYaml';

export function serializeBlockToYaml(block: Block): string {
  return `--- !Block
Timestamp: ${block.Timestamp.toISOString()}
Difficulty: ${block.Difficulty}
Nonce: ${block.Nonce}
Miner: ${block.Miner}
Transactions:
${serializeTransactionsToYaml(block.Transactions)}\n`;
}