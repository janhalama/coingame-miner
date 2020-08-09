import yaml from 'js-yaml';
import { BlockYamlType } from './BlockYamlType';
import { HashYamlType } from './HashYamlType';
import { TransactionYamlType } from './TransactionYamlType';

export const coinGameSchema = yaml.Schema.create([BlockYamlType, HashYamlType, TransactionYamlType]);
