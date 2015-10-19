'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});
exports['default'] = controllerRun;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _cliJs = require('../cli.js');

var _componentScenarioRunnerJs = require('../component/scenarioRunner.js');

var _suspend = require('suspend');

var _suspend2 = _interopRequireDefault(_suspend);

require('colors');

var _os = require('os');

var _os2 = _interopRequireDefault(_os);

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _mkdirp = require('mkdirp');

var _mkdirp2 = _interopRequireDefault(_mkdirp);

var _crypto = require('crypto');

var _crypto2 = _interopRequireDefault(_crypto);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _mime = require('mime');

var _mime2 = _interopRequireDefault(_mime);

function controllerRun(commander) {
  (0, _cliJs.optionRequired)('path');
  const filePath = commander.path;
  _suspend2['default'].run(function* () {
    console.log(`Trying to load the scenario under the ${ filePath }`);
    const scenario = (0, _componentScenarioRunnerJs.load)(filePath);
    console.log('Loaded! Trying to start the scenario...');
    if (typeof scenario !== 'function') {
      console.log('Scenario should be a function!');
      process.exit(1);
    }

    function formattedPrint(message) {
      console.log('\n' + `===== ${ message } =====`.bold + '\n');
    }

    formattedPrint(`Start: ${ filePath }`);

    const result = yield (0, _componentScenarioRunnerJs.run)(scenario);

    const statusColor = result.status === 'success' ? 'green' : 'red';
    console.log(`Status: ${ result.status[statusColor] }.`);

    const messageColor = {
      info: 'cyan',
      warning: 'yellow'
    };
    var _arr = ['info', 'warning'];
    for (var _i = 0; _i < _arr.length; _i++) {
      let type = _arr[_i];
      if (result[type].length) {
        console.log(`There was some ${ type } messages:`);
        var _iteratorNormalCompletion2 = true;
        var _didIteratorError2 = false;
        var _iteratorError2 = undefined;

        try {
          for (var _iterator2 = result[type][Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
            let message = _step2.value;

            console.log(`\t${ message }`[messageColor[type]]);
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
      } else {
        console.log(`There wasn\'t any ${ type } messages`);
      }
    }

    console.log(`Final message: ${ result.finalMessage.blue }.`);

    if (result.files.length) {
      const tmpDir = _path2['default'].join(_os2['default'].tmpdir(), 'wardenjs_tmp', _crypto2['default'].createHash('md5').update(filePath).digest('hex'));

      yield (0, _mkdirp2['default'])(tmpDir, _suspend2['default'].resume());
      var _iteratorNormalCompletion = true;
      var _didIteratorError = false;
      var _iteratorError = undefined;

      try {
        for (var _iterator = result.files[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
          let file = _step.value;

          const filePath = _path2['default'].join(tmpDir, `${ file.name }.${ _mime2['default'].extension(file.media) }`);
          yield _fs2['default'].writeFile(filePath, file.content, _suspend2['default'].resume());
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

      console.log(`There was ${ result.files.length } file(s) attached.`, `You can find them at: ${ tmpDir.blue }`);
    }

    formattedPrint(`End: ${ filePath }`);
  });
}

module.exports = exports['default'];
//# sourceMappingURL=run.js.map
