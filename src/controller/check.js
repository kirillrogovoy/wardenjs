import {optionRequired} from '../cli.js';
import * as config from '../component/config.js';
import suspend from 'suspend';

export default function check(commander) {
  optionRequired('config');
  suspend.run(function*() {
    const configObj = yield config.load(commander.config);
    config.validate(configObj);
    console.log('All is OK!');
  });
}
