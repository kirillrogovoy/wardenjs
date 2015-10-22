import {optionRequired} from '../cli.js';
import * as config from '../component/config.js';
import suspend from 'suspend';

export default function watch(commander) {
  optionRequired('config');
  suspend.run(function*() {
    const configObj = yield config.load(commander.config);
    config.validate(configObj);
    const db = require('../component/daemon/postgres.js')(configObj.postgres);
    console.log('got db');
  });
}
