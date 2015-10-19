import {optionRequired} from '../cli.js';
import * as config from '../component/config.js';
import suspend from 'suspend';

export default function listScenarios(commander) {
  optionRequired('config');
  suspend.run(function*() {
    let configObj = yield config.load(commander.config);
    config.validate(configObj);
    console.log(config.getScenarioFiles(config.scenarioFiles)
      .join('\n'));
  });
}
