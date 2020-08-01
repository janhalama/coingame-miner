import yaml from 'js-yaml'
import { Hash } from '../models/Hash';

export const HashYamlType = new yaml.Type('!Hash', {
  kind: 'mapping',
  construct: function (data) {
    data = data || {}; // in case of empty node
    return new Hash(data.Digest);
  },
  instanceOf: Hash
});