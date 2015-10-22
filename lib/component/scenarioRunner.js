'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});
exports.load = load;
exports.run = run;
exports.runForked = runForked;
exports.runGroup = runGroup;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _utilJs = require('../util.js');

var _assert = require('assert');

var _assert2 = _interopRequireDefault(_assert);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _suspend = require('suspend');

var _suspend2 = _interopRequireDefault(_suspend);

var _mime = require('mime');

var _mime2 = _interopRequireDefault(_mime);

var _child_process = require('child_process');

function load(filePath) {
  let fullPath;
  if (_path2['default'].isAbsolute(filePath)) {
    fullPath = _path2['default'].normalize(filePath);
  } else {
    fullPath = _path2['default'].join(process.cwd(), filePath);
  }

  return require(fullPath);
}

function run(scenario, config) {
  _utilJs.check['function'](scenario.fn);
  _utilJs.check.string(scenario.name);
  return new Promise(resolve => {
    let timeoutId;
    const result = {
      finalMessage: null,
      warning: [],
      info: [],
      status: null,
      files: [],
      name: scenario.name
    };

    const control = {
      warning(text) {
        return message(text, 'warning');
      },
      info(text) {
        return message(text, 'info');
      },
      success() {
        let message = arguments.length <= 0 || arguments[0] === undefined ? 'Passed' : arguments[0];
        return finish('success', message);
      },
      failure() {
        let message = arguments.length <= 0 || arguments[0] === undefined ? 'Failed' : arguments[0];
        return finish('failure', message);
      },
      /** input can be either a path or content **/
      file: _suspend2['default'].promise(function* (name, input, media) {
        if (result.status !== null) throw Error('Scenario is already finished!');
        let fileContent;

        _utilJs.check.string(name);

        if (typeof input === 'string') {
          if (!_path2['default'].isAbsolute(input)) {
            throw Error('path should be absolute!');
          }
          const fileExists = yield _fs2['default'].exists(input, _suspend2['default'].resumeRaw());
          if (!fileExists) {
            throw Error(`File '${ input }' doesn't exist!`);
          }

          fileContent = yield _fs2['default'].readFile(input, _suspend2['default'].resume());
        } else if (Buffer.prototype.isPrototypeOf(input)) {
          fileContent = input;
        } else {
          throw Error('input should be either string or buffer!');
        }

        _utilJs.check.string(media);
        const fileExtension = _mime2['default'].extension(media);
        if (!fileExtension) {
          throw Error(`Unknown mime type: ${ media }`);
        }

        result.files.push({
          name,
          media,
          content: fileContent
        });

        return true;
      })
    };

    function onError(err) {
      control.failure('Scenario is broken! There was an unexpected error.\n' + `Stack: ${ err.stack }\n`);
    }

    function onErrorHandler(err) {
      clearTimeout(timeoutId);
      onError(err);
    }

    function message(text, type) {
      if (result.status !== null) return false;
      _utilJs.check.string(text);
      result[type].push(text);
      return true;
    }

    function finish(status, finalMessage) {
      if (result.status !== null) return false;
      process.removeListener('uncaughtException', onErrorHandler);

      _utilJs.check.string(status);
      _utilJs.check.either.string(finalMessage).or.error(finalMessage);
      finalMessage = String(finalMessage);
      const statuses = ['success', 'failure'];
      (0, _assert2['default'])(statuses.indexOf(status) !== -1, `Status can be only one of this values: ${ statuses }`);

      clearTimeout(timeoutId);
      result.finalMessage = finalMessage;
      result.status = status;
      resolve(result);
      return true;
    }

    const timeoutSecs = 10;
    timeoutId = setTimeout(() => {
      control.failure(`TIMEOUT: ${ timeoutSecs } seconds.`);
    }, timeoutSecs * 1000);

    process.on('uncaughtException', onErrorHandler);
    try {
      scenario.fn(control, config);
    } catch (e) {
      onError(e);
    }
  });
}

function runForked(scenarioFile, configPath) {
  console.log(configPath);
  _utilJs.check.string(scenarioFile);
  return new Promise((resolve, reject) => {
    const child = (0, _child_process.fork)(_path2['default'].join(_utilJs.root, 'index.js'), ['run', '--path', scenarioFile, '--config', configPath], {
      silent: global.silentFork !== undefined ? global.silentFork : false
    });
    child.on('error', reject);
    child.on('message', result => {
      if (result.type === 'SCENARIO_RESULT') {
        child.kill();
        resolve(result.data);
      }
    });
  });
}

function runGroup(scenarioFiles, configPath) {
  return Promise.all(scenarioFiles.map(s => runForked(s, configPath)));
}
//# sourceMappingURL=scenarioRunner.js.map
