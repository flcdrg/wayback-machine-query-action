import {
  ILycheeData,
  IWaybackData,
  findWaybackUrls
} from '../src/findWaybackUrls';
import { expect, test } from '@jest/globals';
import { promises as fs } from 'fs';

let data: ILycheeData;

// Setup mock data
const mockData: { [id: string]: IWaybackData } = {};
mockData[
  'https://archive.org/wayback/available?url=http%3A%2F%2Fwww.microsoft.com%2Fresources%2Fdocumentation%2Fwindowsnt%2F4%2Fserver%2Freskit%2Fen-us%2Freskt4u4%2Frku4list.mspx%3Fmfr%3Dtrue&timestamp=20090330'
] = {
  url: 'http://www.microsoft.com/resources/documentation/windowsnt/4/server/reskit/en-us/reskt4u4/rku4list.mspx?mfr=true',
  archived_snapshots: {
    closest: {
      status: '200',
      available: true,
      url: 'http://web.archive.org/web/20091206231445/http://www.microsoft.com:80/resources/documentation/windowsnt/4/server/reskit/en-us/reskt4u4/rku4list.mspx?mfr=true',
      timestamp: '20091206231445'
    }
  },
  timestamp: '20090330'
};
mockData[
  'https://archive.org/wayback/available?url=http%3A%2F%2Fwww.microsoft.com%2Fresources%2Fdocumentation%2Fwindowsnt%2F4%2Fserver%2Freskit%2Fen-us%2Freskt4u4%2Frku4list.mspx%3Fmfr%3Dtrue'
] = {
  url: 'http://www.microsoft.com/resources/documentation/windowsnt/4/server/reskit/en-us/reskt4u4/rku4list.mspx?mfr=true',
  archived_snapshots: {
    closest: {
      status: '200',
      available: true,
      url: 'http://web.archive.org/web/20150621050452/http://www.microsoft.com:80/resources/documentation/windowsnt/4/server/reskit/en-us/reskt4u4/rku4list.mspx?mfr=true',
      timestamp: '20150621050452'
    }
  }
};
mockData[
  'https://archive.org/wayback/available?url=http%3A%2F%2Fwww.sqlserver.org.au%2F&timestamp=20090330'
] = {
  url: 'http://www.sqlserver.org.au/',
  archived_snapshots: {},
  timestamp: '20090330'
};
mockData[
  'https://archive.org/wayback/available?url=http%3A%2F%2Fblog.spencen.com%2F'
] = {
  url: 'http://blog.spencen.com/',
  archived_snapshots: {
    closest: {
      status: '200',
      available: true,
      url: 'http://web.archive.org/web/20210307213458/http://blog.spencen.com/',
      timestamp: '20210307213458'
    }
  }
};
mockData[
  'https://archive.org/wayback/available?url=http%3A%2F%2Fwww.microsoft.com%2Fwindowsserver2003%2Ftechnologies%2Fnetworking%2Fipsec%2Fdefault.mspx%23EGAA'
] = {
  url: 'http://www.microsoft.com/windowsserver2003/technologies/networking/ipsec/default.mspx#EGAA',
  archived_snapshots: {
    closest: {
      status: '200',
      available: true,
      url: 'http://web.archive.org/web/20171221142706/http://www.microsoft.com/windowsserver2003/technologies/networking/ipsec/default.mspx',
      timestamp: '20171221142706'
    }
  }
};
mockData[
  'https://archive.org/wayback/available?url=http%3A%2F%2Fwww.microsoft.com%2Fwindowsserver2003%2Ftechnologies%2Fnetworking%2Fipsec%2Fdefault.mspx%23EGAA&timestamp=20050330'
] = {
  url: 'http://www.microsoft.com/windowsserver2003/technologies/networking/ipsec/default.mspx#EGAA',
  archived_snapshots: {
    closest: {
      status: '200',
      available: true,
      url: 'http://web.archive.org/web/20050404133316/http://www.microsoft.com:80/windowsserver2003/technologies/networking/ipsec/default.mspx',
      timestamp: '20050404133316'
    }
  },
  timestamp: '20050330'
};
mockData[
  'https://archive.org/wayback/available?url=http%3A%2F%2Fwww.sqlserver.org.au%2F&timestamp=20090819'
] = {
  url: 'http://www.sqlserver.org.au/',
  archived_snapshots: {
    closest: {
      status: '200',
      available: true,
      url: 'http://web.archive.org/web/20090913130433/http://www.sqlserver.org.au/',
      timestamp: '20090913130433'
    }
  },
  timestamp: '20090819'
};
mockData[
  'https://archive.org/wayback/available?url=http%3A%2F%2Fblog.spencen.com%2F2010%2F04%2F06%2Fnew-laptop-ndash-sony-z-series.aspx'
] = {
  url: 'http://blog.spencen.com/2010/04/06/new-laptop-ndash-sony-z-series.aspx',
  archived_snapshots: {
    closest: {
      status: '200',
      available: true,
      url: 'http://web.archive.org/web/20140311011355/http://blog.spencen.com:80/2010/04/06/new-laptop-ndash-sony-z-series.aspx',
      timestamp: '20140311011355'
    }
  }
};
mockData[
  'https://archive.org/wayback/available?url=http%3A%2F%2Fblog.spencen.com%2F2010%2F04%2F06%2Fnew-laptop-ndash-sony-z-series.aspx&timestamp=20090819'
] = {
  url: 'http://blog.spencen.com/2010/04/06/new-laptop-ndash-sony-z-series.aspx',
  archived_snapshots: {
    closest: {
      status: '200',
      available: true,
      url: 'http://web.archive.org/web/20100413130912/http://blog.spencen.com:80/2010/04/06/new-laptop-ndash-sony-z-series.aspx',
      timestamp: '20100413130912'
    }
  },
  timestamp: '20090819'
};
mockData[
  'https://archive.org/wayback/available?url=http%3A%2F%2Fwww.sqlsnapshots.com%2FSQLSnapshotsMP3Feed.xml&timestamp=20090819'
] = {
  url: 'http://www.sqlsnapshots.com/SQLSnapshotsMP3Feed.xml',
  archived_snapshots: {},
  timestamp: '20090819'
};
mockData[
  'https://archive.org/wayback/available?url=http%3A%2F%2Fwww.sqlserver.org.au%2F'
] = {
  url: 'http://www.sqlserver.org.au/',
  archived_snapshots: {
    closest: {
      status: '200',
      available: true,
      url: 'http://web.archive.org/web/20180823174410/http://www.sqlserver.org.au:80/',
      timestamp: '20180823174410'
    }
  }
};
mockData[
  'https://archive.org/wayback/available?url=http%3A%2F%2Fblog.spencen.com%2F&timestamp=20090330'
] = {
  url: 'http://blog.spencen.com/',
  archived_snapshots: {
    closest: {
      status: '200',
      available: true,
      url: 'http://web.archive.org/web/20090228132238/http://blog.spencen.com:80/',
      timestamp: '20090228132238'
    }
  },
  timestamp: '20090330'
};
mockData[
  'https://archive.org/wayback/available?url=http%3A%2F%2Fwww.sqlsnapshots.com%2FSQLSnapshotsMP3Feed.xml'
] = {
  url: 'http://www.sqlsnapshots.com/SQLSnapshotsMP3Feed.xml',
  archived_snapshots: {}
};

// Mock the global fetch function
global.fetch = jest.fn((input: string | URL | Request): Promise<Response> => {
  const url = typeof input === 'string' ? input : input.toString();
  if (mockData.hasOwnProperty(url)) {
    return Promise.resolve({
      ok: true,
      json: () => Promise.resolve(mockData[url])
    } as Response);
  } else {
    return Promise.resolve({
      ok: false,
      statusText: `Unknown url: ${url}`
    } as Response);
  }
});

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
