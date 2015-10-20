'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _suspend = require('suspend');

var _suspend2 = _interopRequireDefault(_suspend);

var _nightmare = require('nightmare');

var _nightmare2 = _interopRequireDefault(_nightmare);

exports['default'] = {
  fn: _suspend2['default'].fn(function* (control) {
    const screenshotPath = '/tmp/rentsoft.png';
    yield (0, _nightmare2['default'])({
      width: 1600,
      height: 900
    }).goto('https://bo.rentsoft.ru').type('#email', 'kro@velvica.com').type('#password', '123456').click('input[type="submit"]').wait('body').screenshot(screenshotPath).end();
    yield control.file('screenshot1', screenshotPath, 'image/png');
    control.success();
  }),
  name: 'core.velvica'
};
module.exports = exports['default'];
//# sourceMappingURL=velvica.js.map
