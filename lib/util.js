'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});
exports.nightmare = nightmare;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _suspend = require('suspend');

var _suspend2 = _interopRequireDefault(_suspend);

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _nightmare2 = require('nightmare');

var _nightmare3 = _interopRequireDefault(_nightmare2);

var _tmp = require('tmp');

var _tmp2 = _interopRequireDefault(_tmp);

var _checkTypes = require('check-types');

var _checkTypes2 = _interopRequireDefault(_checkTypes);

const root = _path2['default'].join(__dirname, '../lib');
exports.root = root;
const check = _checkTypes2['default'].assert;

exports.check = check;

function nightmare(control) {
  check.object(control);
  const _nightmare = (0, _nightmare3['default'])({
    width: 1600,
    height: 900
  });

  const screenshot = _nightmare.screenshot.bind(_nightmare);
  _nightmare.$screenshot = _suspend2['default'].promise(function* (name) {
    const tmpName = yield _tmp2['default'].tmpName({ template: '/tmp/nightmare-tmp-XXXXXX' }, _suspend2['default'].resume());
    const media = 'image/png';
    const result = yield screenshot(tmpName, _suspend2['default'].resume());
    console.log(result);
    yield control.file(name, tmpName, media);
    yield _fs2['default'].unlink(tmpName, _suspend2['default'].resume());
    return result;
  });
  return _nightmare;
}
//# sourceMappingURL=util.js.map
