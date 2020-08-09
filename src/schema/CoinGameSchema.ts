import yaml from 'js-yaml';
import { blockYamlType } from './BlockYamlType';
import { hashYamlType } from './HashYamlType';
import { transactionYamlType } from './TransactionYamlType';

export const coinGameSchema = yaml.Schema.create([blockYamlType, hashYamlType, transactionYamlType]);
