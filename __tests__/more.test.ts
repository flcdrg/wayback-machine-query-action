import {
  ILycheeData,
  findWaybackUrls,
  IWaybackData
} from '../src/findWaybackUrls';

let data: ILycheeData;

// Setup mock responses for this test
const mockMoreData: { [id: string]: IWaybackData } = {
  'https://archive.org/wayback/available?url=http%3A%2F%2Fwww.jetbrains.net%2Fconfluence%2Fdisplay%2FReSharper%2FReSharper%2B4.5%2BNightly%2BBuilds':
    {
      url: 'http://www.jetbrains.net/confluence/display/ReSharper/ReSharper+4.5+Nightly+Builds',
      archived_snapshots: {
        closest: {
          status: '200',
          available: true,
          url: 'http://web.archive.org/web/20090401043902/http://www.jetbrains.net/confluence/display/ReSharper/ReSharper+4.5+Nightly+Builds',
          timestamp: '20090401043902'
        }
      }
    },
  'https://archive.org/wayback/available?url=http%3A%2F%2Fwww.soundgraph.com%2FEng_%2FSupports%2FDownloadList.aspx%3FtopMenu%3D4%26subMenu%3D1%26leftMenu%3D1':
    {
      url: 'http://www.soundgraph.com/Eng_/Supports/DownloadList.aspx?topMenu=4&subMenu=1&leftMenu=1',
      archived_snapshots: {
        closest: {
          status: '200',
          available: true,
          url: 'http://web.archive.org/web/20080815035541/http://www.soundgraph.com/Eng_/Supports/DownloadList.aspx?topMenu=4&subMenu=1&leftMenu=1',
          timestamp: '20080815035541'
        }
      }
    },
  'https://archive.org/wayback/available?url=http%3A%2F%2Fwww.newmagic.com.au%2FSupport%2FHauppauge_Vista_Drivers.html':
    {
      url: 'http://www.newmagic.com.au/Support/Hauppauge_Vista_Drivers.html',
      archived_snapshots: {
        closest: {
          status: '200',
          available: true,
          url: 'http://web.archive.org/web/20080601094507/http://www.newmagic.com.au/Support/Hauppauge_Vista_Drivers.html',
          timestamp: '20080601094507'
        }
      }
    }
};

// Mock the global fetch function
global.fetch = jest.fn((input: string | URL | Request): Promise<Response> => {
  const url = typeof input === 'string' ? input : input.toString();
  if (mockMoreData.hasOwnProperty(url)) {
    return Promise.resolve({
      ok: true,
      json: () => Promise.resolve(mockMoreData[url])
    } as Response);
  } else {
    return Promise.resolve({
      ok: false,
      statusText: `Unknown url: ${url}`
    } as Response);
  }
});

beforeAll(async () => {
  data = {
    error_map: {
      'dist/2009/03/visual-studio-2008-at-100-cpu-scrolling.html': [
        {
          url: 'http://www.jetbrains.net/confluence/display/ReSharper/ReSharper+4.5+Nightly+Builds',
          status: {
            text: 'Error (cached)',
            code: 404
          }
        }
      ],
      'dist/2008/08/finishing-home-theatre-pc.html': [
        {
          url: 'http://www.soundgraph.com/Eng_/Supports/DownloadList.aspx?topMenu=4&subMenu=1&leftMenu=1',
          status: {
            text: 'Error (cached)',
            code: 404
          }
        },
        {
          url: 'http://www.newmagic.com.au/Support/Hauppauge_Vista_Drivers.html',
          status: {
            text: 'Error (cached)',
            code: 404
          }
        }
      ]
    }
  };
});

test('handle single and multiple array values', async () => {
  const result = await findWaybackUrls(data);

  expect(result).toMatchSnapshot();
});
