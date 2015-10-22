import fs from 'fs';
import path from 'path';
import suspend from 'suspend';
import assert from 'assert';
import {root, check} from '../util.js';
import readdirRecursive from 'recursive-readdir-sync';

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
      readdirRecursive(fullPath)
        .filter((item) => /^.*\.js$/.test(item))
        .map((item) => path.join(item))
    );
  }
  return files;
}

export function getGroups(groups, scenarioFiles) {
  if (groups == null) return {};
  
  check.object(groups);
  for (let groupName of Object.keys(groups)) {
    const group = groups[groupName];
    check.array.of.string(group);
    groups[groupName] = group.map((filePattern) => {
      return scenarioFiles.find((file) => {
        return (new RegExp(filePattern).test(file));
      });
    });
  }
  
  return groups;
}

export function validate(config) {
  check.object(config);
  check.array.of.string(config.scenarioDirs, 'Malformed config.scenarioDirs');
  const scenarioFiles = getScenarioFiles(config.scenarioDirs);
  getGroups(config.groups, scenarioFiles);
}

export const load = suspend.promise(function*(relativePath) {
  const fullPath = path.join(process.cwd(), relativePath);
  return JSON.parse(yield fs.readFile(fullPath, suspend.resume()));
});
