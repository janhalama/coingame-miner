import fs from 'fs';
import { computeDigest } from './computeDigest';

describe('computeDigest', () => {
  test('computes correct digest', async () => {
    const hash = (await fs.promises.readFile('./testVectors/firstHash.yaml')).toString('utf8');
    const block = (await fs.promises.readFile('./testVectors/firstBlock.yaml')).toString('utf8');
    const digest = computeDigest(hash, block);
    expect(digest).toEqual(
      '00000000b9d0b0ceeee295cb2c02387d16ecf3b52a0811f165e5902ef78659db96e409b9493ba7fe4433e2439f5672a7',
    );
  });
});
