import yaml from 'js-yaml';
import { Transaction } from '../models/Transaction';

export const transactionYamlType = new yaml.Type('!Transaction', {
  kind: 'mapping',
  construct: function (data: any) {
    const safeData = data || {}; // in case of empty node

    return new Transaction(
      safeData.Fee,
      safeData.Id ? BigInt(safeData.Id) : undefined,
      safeData.ValidTo,
      safeData.Data,
    );
  },
  instanceOf: Transaction,
});
