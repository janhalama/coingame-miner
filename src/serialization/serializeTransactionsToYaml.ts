import { Transaction } from '../models/Transaction';

export function serializeTransactionsToYaml(transactions: Transaction[]): string {
  let result = '';
  transactions.map((transaction) => {
    result = result + serializeTransactionToYaml(transaction);
  })
  return result;
}

function serializeTransactionToYaml(transaction: Transaction): string {
  if (transaction.Id && transaction.Data) {
    return `\n  - !Transaction
    Id: ${transaction.Id}
    Fee: ${transaction.Fee.toFixed(1)}
    Data: !!binary |
      ${transaction.Data.toString('base64')}`;
  } else {
    return `  - !Transaction
    Fee: ${transaction.Fee.toFixed(1)}`;
  }
}