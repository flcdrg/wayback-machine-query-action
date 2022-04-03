import { ILycheeData, findWaybackUrls } from '../src/findWaybackUrls';
import { expect, test } from '@jest/globals';

test('url', () => {
  const u = new URL('fish://example.org');
  u.searchParams.append('a', 'b');

  expect(u.toString()).toEqual('fish://example.org?a=b');
});

test('finds urls', async () => {
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

  const result = await findWaybackUrls(data);

  expect(result).toMatchSnapshot();
});
