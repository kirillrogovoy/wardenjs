import {optionRequired} from '../cli.js';
import suspend from 'suspend';
import assert from 'assert';
import * as config from '../component/config.js';
import 'colors';
import {runGroup, runForked} from '../component/scenarioRunner.js';

export default suspend.fn(function*(commander) {
  optionRequired('config');
  optionRequired('group');
  const groupName = commander.group;
  const mode = commander.runMode || 'async';
  assert(['sync', 'async'].indexOf(mode) > -1);
  
  console.log(`Trying to load the group: ${groupName}`);
  const configObj = yield config.load(commander.config);
  const scenarioFiles = config.getScenarioFiles(configObj.scenarioDirs);
  const groups = config.getGroups(configObj.groups, scenarioFiles);
  if (!groups.hasOwnProperty(groupName)) {
    console.error('Couldn\'t find the group. Here are existing groups:\n'.red +
    `${Object.keys(groups).join(', ').red}`);
  }
  
  const group = groups[groupName];
  let results = [];
  if (mode === 'async') {
    results = yield runGroup(group, commander.config);
  } else {
    for (let scenarioFile of group) {
      results.push(yield runForked(scenarioFile, commander.config));
    }
  }
  
  const success = results.filter((r) => r.status === 'success');
  const failure = results.filter((r) => r.status === 'failure');
  
  console.log(
    `\nGroup run has been finished! ${results.length} scenarios have been run.`.blue,
    `\n${success.length} passed`.green,
    `\n${failure.length} failed`.red
  );
  
  if (failure.length) {
    console.log(
      'Failed tests are:\n  ',
      failure.map((f) => f.name.red).join(',  \n')
    );
  }
});
