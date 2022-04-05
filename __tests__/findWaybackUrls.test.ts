import { ILycheeData, findWaybackUrls } from '../src/findWaybackUrls';
import { expect, test } from '@jest/globals';
import { promises as fs } from 'fs';

let data: ILycheeData;

beforeAll(async () => {
  data = JSON.parse(await fs.readFile('__tests__/data.json', 'utf-8'));
});

test('finds urls', async () => {
  const result = await findWaybackUrls(data);

  expect(result).toMatchSnapshot();
});

test('finds urls with timestamp', async () => {
  const regex = /_posts\/(\d+)\/(?<year>\d+)-(?<month>\d+)-(?<day>\d+)-/;
  const result = await findWaybackUrls(data, regex);

  expect(result).toMatchSnapshot();
});
