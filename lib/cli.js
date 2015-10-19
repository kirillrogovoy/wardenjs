'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});
var _slice = Array.prototype.slice;
exports.optionRequired = optionRequired;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _commander = require('commander');

var _commander2 = _interopRequireDefault(_commander);

var _packageJson = require('../package.json');

var _packageJson2 = _interopRequireDefault(_packageJson);

function command(commander, name) {
  let description = arguments[2] === undefined ? '' : arguments[2];
  let args = arguments[3] === undefined ? null : arguments[3];

  let commandText = name;
  if (args) commandText += ' ' + args;

  commander.command(commandText).description(description).action(function () {
    require(`./controller/${ name }.js`).apply(undefined, [commander].concat(_slice.call(arguments)));
  });
}

function optionRequired(name) {
  if (_commander2['default'][name]) {
    return;
  }
  console.log(`Please, specify the option "${ name }"! (see --help)`);
  process.exit(1);
}

_commander2['default'].version(_packageJson2['default'].version);
_commander2['default'].option('-c, --config <path>', 'Path to the config file');
_commander2['default'].option('-p, --path <path>', 'Path to the scenario file');
command(_commander2['default'], 'check', 'Check whether all is ok');
command(_commander2['default'], 'list-scenarios', 'Get list of the all available scenarios');
command(_commander2['default'], 'run', 'Run a scenario and print the results');
const program = _commander2['default'].parse(process.argv);
if (typeof program.args[0] !== 'object') {
  console.log('Wrong usage. Please, check --help');
  process.exit(1);
}

if (!process.argv.slice(2).length) {
  _commander2['default'].outputHelp();
}
//# sourceMappingURL=cli.js.map
