import axios from 'axios';
import * as core from '@actions/core';

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
  replacements: {
    find: string;
    replace: string;
  }[];
  missing: string[];
};

export async function findWaybackUrls(
  data: ILycheeData,
  regex?: RegExp
): Promise<IReplacements> {
  const failedMap = data.fail_map;

  const results: IReplacements = {
    replacements: [],
    missing: []
  };

  for (const key in failedMap) {
    if (Object.prototype.hasOwnProperty.call(data.fail_map, key)) {
      const element = data.fail_map[key];

      // look up date in key.
      let timestamp: string | undefined;

      if (regex) {
        const matches = regex.exec(key);

        if (matches && matches.groups && matches.groups.year) {
          const groups = matches.groups;
          timestamp = groups.year;

          if (groups.month) {
            timestamp += groups.month;
          }

          if (groups.day) {
            timestamp += groups.day;
          }
        }
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

          if (waybackData.archived_snapshots.closest) {
            results.replacements.push({
              find: waybackData.url,
              replace: waybackData.archived_snapshots.closest.url
            });
          } else {
            core.warning(`Failed to find snapshot for ${waybackData.url}`);
            results.missing.push(waybackData.url);
          }
        }
      }
    }
  }

  return results;
}
