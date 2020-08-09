import yaml from 'js-yaml';
import { Block } from '../models/Block';

export const blockYamlType = new yaml.Type('!Block', {
  kind: 'mapping',
  construct: function (data: any) {
    const safeData = data || {}; // in case of empty node

    return new Block(safeData.Timestamp, safeData.Difficulty, safeData.Nonce, safeData.Miner, safeData.Transactions);
  },
  instanceOf: Block,
});
