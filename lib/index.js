'use strict';

require('source-map-support/register');

require('babel/polyfill');

var _errorHandlingJs = require('./errorHandling.js');

require('./cli.js');

(0, _errorHandlingJs.installErrorListener)();
//# sourceMappingURL=index.js.map
