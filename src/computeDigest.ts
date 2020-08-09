import crypto from 'crypto';

export function computeDigest(currentHashYaml: string, newBlockYaml: string): string {
  const hash = crypto.createHash('sha384');
  hash.update(currentHashYaml, 'utf8');
  hash.update(newBlockYaml, 'utf8');
  hash.update(currentHashYaml, 'utf8');
  const data = hash.update(newBlockYaml, 'utf8');

  return data.digest('hex');
}
