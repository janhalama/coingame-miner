import yaml from 'js-yaml';
import { Transaction } from '../models/Transaction';

export const TransactionYamlType = new yaml.Type('!Transaction', {
  kind: 'mapping',
  construct: function (data) {
    data = data || {}; // in case of empty node

    return new Transaction(data.Fee, data.Id ? BigInt(data.Id) : undefined, data.ValidTo, data.Data);
  },
  instanceOf: Transaction,
});
