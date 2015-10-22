import suspend from 'suspend';
import {nightmare} from '../util.js';

export default {
  fn: suspend.fn(function*(control, config) {
    const n = nightmare(control);
    yield n
      .goto('https://bo.rentsoft.ru')
      .type('#email', 'kro@velvica.com')
      .type('#password', '123456')
      .click('input[type="submit"]')
      .wait('body');
    yield n.$screenshot('screenshot1');
    yield n.end();
    control.success();
  }),
  name: 'core.velvica'
};
