'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});
exports.getScenarioFiles = getScenarioFiles;
exports.getGroups = getGroups;
exports.validate = validate;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _suspend = require('suspend');

var _suspend2 = _interopRequireDefault(_suspend);

var _assert = require('assert');

var _assert2 = _interopRequireDefault(_assert);

var _utilJs = require('../util.js');

var _recursiveReaddirSync = require('recursive-readdir-sync');

var _recursiveReaddirSync2 = _interopRequireDefault(_recursiveReaddirSync);

function getScenarioFiles(scenarioDirs) {
  _utilJs.check.array.of.string(scenarioDirs);
  let files = [];
  var _iteratorNormalCompletion = true;
  var _didIteratorError = false;
  var _iteratorError = undefined;

  try {
    for (var _iterator = scenarioDirs[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
      let scenarioDir = _step.value;

      let fullPath = scenarioDir;
      if (!_path2['default'].isAbsolute(scenarioDir)) {
        fullPath = _path2['default'].join(_utilJs.root, scenarioDir);
      }

      (0, _assert2['default'])(_fs2['default'].statSync(fullPath).isDirectory(), `${ fullPath } is not a directory!`);
      files = files.concat((0, _recursiveReaddirSync2['default'])(fullPath).filter(item => /^.*\.js$/.test(item)).map(item => _path2['default'].join(item)));
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

  return files;
}

function getGroups(groups, scenarioFiles) {
  if (groups == null) return {};

  _utilJs.check.object(groups);
  var _iteratorNormalCompletion2 = true;
  var _didIteratorError2 = false;
  var _iteratorError2 = undefined;

  try {
    for (var _iterator2 = Object.keys(groups)[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
      let groupName = _step2.value;

      const group = groups[groupName];
      _utilJs.check.array.of.string(group);
      groups[groupName] = group.map(filePattern => {
        return scenarioFiles.find(file => {
          return new RegExp(filePattern).test(file);
        });
      });
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

  return groups;
}

function validate(config) {
  _utilJs.check.object(config);
  _utilJs.check.array.of.string(config.scenarioDirs, 'Malformed config.scenarioDirs');
  const scenarioFiles = getScenarioFiles(config.scenarioDirs);
  getGroups(config.groups, scenarioFiles);
}

const load = _suspend2['default'].promise(function* (relativePath) {
  const fullPath = _path2['default'].join(process.cwd(), relativePath);
  return JSON.parse((yield _fs2['default'].readFile(fullPath, _suspend2['default'].resume())));
});
exports.load = load;
//# sourceMappingURL=config.js.map
