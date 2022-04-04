import * as core from '@actions/core';
import { promises as fs } from 'fs';
import path from 'path';
import { findWaybackUrls, parseData } from './findWaybackUrls';

async function run(): Promise<void> {
  try {
    core.info('starting');
    const inputFile: string = core.getInput('source-path', { required: true });
    const outputFile: string = core.getInput('replacements-path');

    const expr = core.getInput('timestamp-regex');
    const regex: RegExp | undefined = expr ? new RegExp(expr) : undefined;

    core.info(`Reading from ${inputFile}`);
    const data = await fs.readFile(inputFile, 'utf8');

    if (!data) {
      core.error('Unable to read from file');
      return;
    }

    const parsed = parseData(data);
    const replacements = await findWaybackUrls(parsed, regex);

    const replacementsString = JSON.stringify(replacements);

    core.info(replacementsString);

    if (outputFile) {
      core.info(`Writing to ${outputFile}`);

      await fs.mkdir(path.dirname(outputFile));
      await fs.writeFile(outputFile, replacementsString);
    }

    core.setOutput('replacements', replacementsString);
  } catch (error) {
    if (error instanceof Error) core.setFailed(error.message);
  }
}

run();
