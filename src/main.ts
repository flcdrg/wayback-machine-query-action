import * as core from '@actions/core';
import * as fs from 'fs';
import { findWaybackUrls, parseData } from './findWaybackUrls';

async function run(): Promise<void> {
  try {
    const inputFile: string = core.getInput('source-path', { required: true });
    const outputFile: string = core.getInput('replacements-path');

    const expr = core.getInput('timestamp-regex');
    const regex: RegExp | undefined = expr ? new RegExp(expr) : undefined;

    const data = readFromFile(inputFile);

    if (!data) {
      return;
    }

    const parsed = parseData(data);
    const replacements = await findWaybackUrls(parsed, regex);

    const replacementsString = JSON.stringify(replacements);

    core.info(replacementsString);

    if (outputFile) {
      fs.writeFile(outputFile, replacementsString, err => {
        core.error(err?.message ?? 'Error writing output file');
      });
    }

    core.setOutput('replacements', replacementsString);
  } catch (error) {
    if (error instanceof Error) core.setFailed(error.message);
  }
}

run();

function readFromFile(file: string): string | undefined {
  let r: string | undefined;
  fs.readFile(file, 'utf8', (err, data) => {
    if (err) {
      core.setFailed(err);
      return;
    }
    r = data;
  });

  return r;
}
