import axios from 'axios';

interface IUrlStatusDictionary {
  [index: string]: {
    url: string;
    status: string;
  }[];
}

export interface ILycheeData {
  fail_map: IUrlStatusDictionary;
}

export function parseData(data: string): ILycheeData {
  const parsed: ILycheeData = JSON.parse(data);
  return parsed;
}

export type IReplacements = {
  find: string;
  replace: string;
}[];

export async function findWaybackUrls(
  data: ILycheeData
): Promise<IReplacements> {
  const failedMap = data.fail_map;

  const results: IReplacements = [];

  for (const key in failedMap) {
    if (Object.prototype.hasOwnProperty.call(data.fail_map, key)) {
      const element = data.fail_map[key];

      // look up date in key.
      // TODO Make this configurable
      const regex = /_posts\/(\d+)\/(\d+)-(\d+)-(\d+)-/;
      const matches = regex.exec(key);

      let timestamp: string | undefined;
      if (matches && matches.length === 5) {
        timestamp = matches[2] + matches[3] + matches[4];
      }

      for (const failedItem of element) {
        if (failedItem.status === 'Timeout') {
          const waybackUrl = new URL('https://archive.org/wayback/available');

          waybackUrl.searchParams.append('url', failedItem.url);

          if (timestamp) {
            waybackUrl.searchParams.append('timestamp', timestamp);
          }

          const res = await axios.get(waybackUrl.toString());

          const waybackData: {
            url: string;
            archived_snapshots: {
              closest: {
                status: string;
                available: boolean;
                url: string;
                timestamp: string;
              };
            };
          } = res.data;

          if (waybackData.archived_snapshots) {
            results.push({
              find: waybackData.url,
              replace: waybackData.archived_snapshots.closest.url
            });
          }
        }
      }
    }
  }

  return results;
}
