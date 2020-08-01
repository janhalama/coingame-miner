import yaml from 'js-yaml'
import { Block } from '../models/Block';

export const BlockYamlType = new yaml.Type('!Block', {
  kind: 'mapping',
  construct: function (data) {
    data = data || {}; // in case of empty node
    return new Block(data.Timestamp, data.Difficulty, data.Nonce, data.Miner, data.Transactions);
  },
  instanceOf: Block
});