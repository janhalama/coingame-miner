import yaml from 'js-yaml'
import { BlockYamlType } from './BlockYamlType';
import { TransactionYamlType } from './TransactionYamlType';
import { HashYamlType } from './HashYamlType';

export const coinGameSchema = yaml.Schema.create([BlockYamlType, HashYamlType, TransactionYamlType]);