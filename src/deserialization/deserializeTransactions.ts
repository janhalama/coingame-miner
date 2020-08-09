import { Transaction } from '../models/Transaction';

export function deserializeTransactions(payload: string): Transaction[] {
  // eslint-disable-next-line no-control-regex
  const result: Transaction[] = [];
  const regexp = new RegExp(/--- !Transaction\nData: !!binary \|\n {2}(.*)\nFee: (.*)\nId: (.*)\nValidTo: (.*)/, 'mg');
  const matches = payload.matchAll(regexp);

  // eslint-disable-next-line no-loops/no-loops
  for (const match of matches) {
    if (!match[4]) {
      continue;
    }
    const validTo = new Date(match[4]);
    validTo.setHours(validTo.getHours() + 2); // terrible serialization of timestamp lead me to this hack
    const t = new Transaction(parseFloat(match[2]), BigInt(match[3]), validTo, Buffer.from(match[1], 'base64'));
    result.push(t);
  }

  return result;
}
