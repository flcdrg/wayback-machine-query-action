import * as core from '@actions/core'
import * as fs from 'fs'
import { findWaybackUrls, parseData } from './findWaybackUrls'

async function run(): Promise<void> {
  try {
    const inputFile: string = core.getInput('input', { required: true});
    const outputFile: string = core.getInput('output');

    const data = readFromFile(inputFile);
    
    if (!data) {
      return
    }

    const parsed = parseData(data);
    const replacements = await findWaybackUrls(parsed)

    const replacementsString = JSON.stringify(replacements);

    core.info(replacementsString);

    fs.writeFile(outputFile, replacementsString, err => {
      core.error(err?.message ?? 'Error writing output file');
    })
    
    core.setOutput('time', new Date().toTimeString())
  } catch (error) {
    if (error instanceof Error) core.setFailed(error.message)
  }
}

run();

function readFromFile(file: string) {
  let r: string | undefined;
  fs.readFile(file, 'utf8' , (err, data) => {
    if (err) {
      core.setFailed(err)
      return;
    }
    r = data;
  });

  return r;
}

