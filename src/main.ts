import * as core from '@actions/core';
import { promises as fs } from 'fs';
import path from 'path';
import { findWaybackUrls, parseData } from './findWaybackUrls';
import _ from 'lodash';

async function run(): Promise<void> {
  try {
    core.info('starting');
    const inputFile: string = core.getInput('source-path', { required: true });
    const outputFile: string = core.getInput('replacements-path');

    const expr = core.getInput('timestamp-regex');
    const safeExpr = _.escapeRegExp(expr);
    const regex: RegExp | undefined =
      safeExpr.length > 0 ? new RegExp(safeExpr) : undefined;

    core.info(`Reading from ${inputFile}`);
    const data = await fs.readFile(inputFile, 'utf8');

    if (!data) {
      core.error('Unable to read from file');
      return;
    }

    const parsed = parseData(data);
    const replacements = await findWaybackUrls(parsed, regex);

    const replacementsString = JSON.stringify(replacements);

    core.debug(replacementsString);

    if (outputFile) {
      core.info(`Writing to ${outputFile}`);

      await fs.mkdir(path.dirname(outputFile));
      await fs.writeFile(outputFile, replacementsString);
    }

    core.setOutput('missing', JSON.stringify(replacements.missing));
    core.setOutput('replacements', JSON.stringify(replacements.replacements));
  } catch (error) {
    if (error instanceof Error) core.setFailed(error.message);
  }
}

run();
