import axios from 'axios';

interface IUrlStatusDictionary {
    [index: string]: Array<
      {
        url: string;
        status: string;
      }>
  };

export interface ILycheeData {
    fail_map: IUrlStatusDictionary;
}

export function parseData(data: string) {
  const parsed: ILycheeData = JSON.parse(data);
  return parsed;
}

export type IReplacements = Array<{
  find: string;
  replace: string;
}>;

export async function findWaybackUrls(data: ILycheeData) {
  const failedMap = data.fail_map;

  const results: IReplacements = [];

  for (const key in failedMap) {
    if (Object.prototype.hasOwnProperty.call(data.fail_map, key)) {
      const element = data.fail_map[key];

      for (const failedItem of element) {

        if (failedItem.status === 'Timeout') {
          
          const waybackUrl = new URL('https://archive.org/wayback/available');

          waybackUrl.searchParams.append('url', failedItem.url);

          const res = await axios
            .get(waybackUrl.toString());

            const data: {
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

            if (data.archived_snapshots) {
              results.push({
                find: data.url,
                replace: data.archived_snapshots.closest.url
              })
            }
        }
      }
    }
  }

  return results;
}
