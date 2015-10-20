'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj['default'] = obj; return newObj; } }

var _cliJs = require('../cli.js');

var _componentConfigJs = require('../component/config.js');

var config = _interopRequireWildcard(_componentConfigJs);

var _suspend = require('suspend');

var _suspend2 = _interopRequireDefault(_suspend);

exports['default'] = function (commander) {
  (0, _cliJs.optionRequired)('config');
  _suspend2['default'].run(function* () {
    let configObj = yield config.load(commander.config);
    config.validate(configObj);
    const scenarioFiles = config.getScenarioFiles(configObj.scenarioDirs);
    console.log(scenarioFiles.join('\n'));

    if (configObj.groups.length) {
      console.log('\nGroups:');
      const groups = config.getGroups(configObj.groups, scenarioFiles);
      var _iteratorNormalCompletion = true;
      var _didIteratorError = false;
      var _iteratorError = undefined;

      try {
        for (var _iterator = Object.keys(groups)[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
          let groupName = _step.value;

          console.log(`  ${ groupName }`);
          var _iteratorNormalCompletion2 = true;
          var _didIteratorError2 = false;
          var _iteratorError2 = undefined;

          try {
            for (var _iterator2 = groups[groupName][Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
              let filePath = _step2.value;

              console.log(`    ${ filePath }`);
            }
          } catch (err) {
            _didIteratorError2 = true;
            _iteratorError2 = err;
          } finally {
            try {
              if (!_iteratorNormalCompletion2 && _iterator2['return']) {
                _iterator2['return']();
              }
            } finally {
              if (_didIteratorError2) {
                throw _iteratorError2;
              }
            }
          }
        }
      } catch (err) {
        _didIteratorError = true;
        _iteratorError = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion && _iterator['return']) {
            _iterator['return']();
          }
        } finally {
          if (_didIteratorError) {
            throw _iteratorError;
          }
        }
      }
    }
  });
};

module.exports = exports['default'];
//# sourceMappingURL=list-scenarios.js.map
