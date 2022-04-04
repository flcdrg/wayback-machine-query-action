import { ILycheeData, findWaybackUrls } from '../src/findWaybackUrls';
import { expect, test } from '@jest/globals';

const data: ILycheeData = {
  fail_map: {
    './_posts/2005/2005-03-30-server-and-domain-isolation-using.md': [
      {
        url: 'http://www.microsoft.com/windowsserver2003/technologies/networking/ipsec/default.mspx#EGAA',
        status: 'Timeout'
      }
    ],
    './_posts/2009/2009-03-30-sas-and-typeperf.md': [
      {
        url: 'http://technet.microsoft.com/en-us/library/cc753182.aspx',
        status: 'Failed: Network error'
      },
      {
        url: 'http://www.sqlserver.org.au/',
        status: 'Timeout'
      },
      {
        url: 'http://www.microsoft.com/resources/documentation/windowsnt/4/server/reskit/en-us/reskt4u4/rku4list.mspx?mfr=true',
        status: 'Timeout'
      }
    ]
  }
};

test('finds urls', async () => {
  const result = await findWaybackUrls(data);

  expect(result).toMatchSnapshot();
});

test('finds urls with timestamp', async () => {
  const regex = /_posts\/(\d+)\/(?<year>\d+)-(?<month>\d+)-(?<day>\d+)-/;
  const result = await findWaybackUrls(data, regex);

  expect(result).toMatchSnapshot();
});
