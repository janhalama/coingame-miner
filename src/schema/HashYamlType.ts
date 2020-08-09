import yaml from 'js-yaml';
import { Hash } from '../models/Hash';

export const hashYamlType = new yaml.Type('!Hash', {
  kind: 'mapping',
  construct: function (data: any) {
    const safeData = data || {}; // in case of empty node

    return new Hash(safeData.Digest);
  },
  instanceOf: Hash,
});
