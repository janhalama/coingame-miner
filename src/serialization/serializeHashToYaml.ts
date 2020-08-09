import { Hash } from '../models/Hash';

export function serializeHashToYaml(hash: Hash): string {
  return `--- !Hash
Digest: '${hash.Digest}'\n`;
}
