'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _bunyan = require('bunyan');

var _bunyan2 = _interopRequireDefault(_bunyan);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _bunyanPrettystream = require('bunyan-prettystream');

var _bunyanPrettystream2 = _interopRequireDefault(_bunyanPrettystream);

let prettyStdOut = new _bunyanPrettystream2['default']({
  mode: 'dev'
});
prettyStdOut.pipe(process.stdout);

exports['default'] = _bunyan2['default'].createLogger({
  name: 'APP',
  streams: [{
    level: 'trace',
    stream: prettyStdOut
  }, {
    level: 'info',
    path: _path2['default'].join(__dirname, '../.log/general.log'),
    type: 'rotating-file',
    period: '1d',
    count: 3
  }]
});
module.exports = exports['default'];
//# sourceMappingURL=log.js.map
