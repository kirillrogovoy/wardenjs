'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _suspend = require('suspend');

var _suspend2 = _interopRequireDefault(_suspend);

var _utilJs = require('../util.js');

exports['default'] = {
  fn: _suspend2['default'].fn(function* (control, config) {
    const n = (0, _utilJs.nightmare)(control);
    yield n.goto('https://bo.rentsoft.ru').type('#email', 'kro@velvica.com').type('#password', '123456').click('input[type="submit"]').wait('body');
    yield n.$screenshot('screenshot1');
    yield n.end();
    control.success();
  }),
  name: 'core.velvica'
};
module.exports = exports['default'];
//# sourceMappingURL=velvica.js.map
