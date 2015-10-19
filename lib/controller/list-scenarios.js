'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});
exports['default'] = listScenarios;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj['default'] = obj; return newObj; } }

var _cliJs = require('../cli.js');

var _componentConfigJs = require('../component/config.js');

var config = _interopRequireWildcard(_componentConfigJs);

var _suspend = require('suspend');

var _suspend2 = _interopRequireDefault(_suspend);

function listScenarios(commander) {
  (0, _cliJs.optionRequired)('config');
  _suspend2['default'].run(function* () {
    let configObj = yield config.load(commander.config);
    config.validate(configObj);
    console.log(config.getScenarioFiles(config.scenarioFiles).join('\n'));
  });
}

module.exports = exports['default'];
//# sourceMappingURL=list-scenarios.js.map
