import axios from 'axios';
import * as core from '@actions/core';
// import crypto from 'crypto';
// import { promises as fs } from 'fs';

interface IUrlStatusDictionary {
  [index: string]: {
    url: string;
    status: string;
  }[];
}

export interface ILycheeData {
  fail_map: IUrlStatusDictionary;
}

export interface IWaybackData {
  url: string;
  archived_snapshots: {
    closest?: {
      status: string;
      available: boolean;
      url: string;
      timestamp: string;
    };
  };
  /**
   * @description Timestamp value from the request
   */
  timestamp?: string;
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

  const replacementDictionary: { [index: string]: string } = {};

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
        if (replacementDictionary.hasOwnProperty(failedItem.url)) {
          continue;
        }

        if (failedItem.status === 'Timeout') {
          const waybackUrl = new URL('https://archive.org/wayback/available');

          waybackUrl.searchParams.append('url', failedItem.url);

          if (timestamp) {
            waybackUrl.searchParams.append('timestamp', timestamp);
          }

          const waybackUrlString = waybackUrl.toString();
          core.info(waybackUrlString);

          const res = await axios.get(waybackUrlString);

          // Generate data for mocking
          // const hash = crypto.createHash('md5').update(waybackUrlString).digest('hex');
          // await fs.writeFile(`__tests__/wayback-${hash}.txt`, `mockData['${waybackUrlString}'] =\n${JSON.stringify(res.data)};`, 'utf-8');

          const waybackData: IWaybackData = res.data;

          if (waybackData.archived_snapshots.closest) {
            if (!replacementDictionary.hasOwnProperty(waybackData.url)) {
              replacementDictionary[waybackData.url] =
                waybackData.archived_snapshots.closest.url;
            }
          } else {
            core.warning(`Failed to find snapshot for ${waybackData.url}`);
            results.missing.push(waybackData.url);
          }
        }
      }
    }
  }

  const keys = Object.keys(replacementDictionary).sort((a, b) =>
    b.localeCompare(a)
  );

  for (const k of keys) {
    results.replacements.push({
      find: k,
      replace: replacementDictionary[k]
    });
  }

  return results;
}
