'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});
exports.run = run;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _utilJs = require('../util.js');

var _assert = require('assert');

var _assert2 = _interopRequireDefault(_assert);

//import suspend from 'suspend';

function run(scenario) {
  _utilJs.check['function'](scenario);
  return new Promise(resolve => {
    const result = {
      warnings: [],
      info: [],
      state: null
    };
    const control = {
      warning(text) {
        return message(text, 'warnings');
      },
      info(text) {
        return message(text, 'info');
      },
      success() {
        return finish('success');
      },
      failure() {
        return finish('failure');
      }
    };

    function message(text, type) {
      _utilJs.check.string(text);
      result[type].push(text);
    }

    function finish(status) {
      if (result.state !== null) {
        throw Error(`The running scenario is already finished with ${ result.state } status!`);
      }

      _utilJs.check.string(status);
      const statuses = ['success', 'failure'];
      (0, _assert2['default'])(statuses.indexOf(status) !== -1, `Status can be only one of this values: ${ statuses }`);

      result.status = status;
      resolve(result);
    }

    scenario(control);
  });
}
//# sourceMappingURL=scenarioExecutor.js.map
