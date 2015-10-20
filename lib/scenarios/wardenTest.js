'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

exports['default'] = {
  fn: function wardenTest(control) {
    control.warning('one');
    control.warning('two');
    control.info('three');
    setTimeout(() => {
      control.file('dog', _path2['default'].join(__dirname, '../../test/fixture/dog.png'), 'image/png').then(() => control.success('I\'m OK!'))['catch'](err => control.failure(err));
    }, 1000);
  },
  name: 'core.wardenTest'
};
module.exports = exports['default'];
//# sourceMappingURL=wardenTest.js.map
