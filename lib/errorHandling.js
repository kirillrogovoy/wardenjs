'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});
exports.listener = listener;
exports.installErrorListener = installErrorListener;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _logJs = require('./log.js');

var _logJs2 = _interopRequireDefault(_logJs);

function listener(err) {
  _logJs2['default'].error(err);
  if (_logJs2['default'].streams[1].stream) {
    _logJs2['default'].streams[1].stream.on('close', function () {
      throw err;
    });
    _logJs2['default'].streams[1].stream.end();
  } else {
    throw err;
  }
}

function installErrorListener() {
  process.on('uncaughtException', listener);
}
//# sourceMappingURL=errorHandling.js.map
