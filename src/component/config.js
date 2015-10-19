import fs from 'fs';
import path from 'path';
import suspend from 'suspend';
import assert from 'assert';
import {root, check} from '../util.js';

export function getScenarioFiles(scenarioDirs) {
  check.array.of.string(scenarioDirs);
  let files = [];
  for (let scenarioDir of scenarioDirs) {
    let fullPath = scenarioDir;
    if (!path.isAbsolute(scenarioDir)) {
      fullPath = path.join(root, scenarioDir);
    }
    
    assert(fs.statSync(fullPath).isDirectory(), `${fullPath} is not a directory!`);
    files = files.concat(
      fs.readdirSync(fullPath)
        .filter((item) => /^.*\.js$/.test(item))
        .map((item) => path.join(fullPath, item))
    );
  }
  return files;
}

export function validate(config) {
  check.object(config);
  check.array.of.string(config.scenarioDirs, 'Malformed config.scenarioDirs');
  getScenarioFiles(config.scenarioDirs);
}

export const load = suspend.promise(function*(relativePath) {
  const fullPath = path.join(process.cwd(), relativePath);
  return JSON.parse(yield fs.readFile(fullPath, suspend.resume()));
});
