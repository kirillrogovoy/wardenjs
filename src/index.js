import 'source-map-support/register';
import 'babel/polyfill';

import {installErrorListener} from './errorHandling.js';

installErrorListener();

import './cli.js';
