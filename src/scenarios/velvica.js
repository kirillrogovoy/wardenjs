import suspend from 'suspend';
import nightmare from 'nightmare';

export default {
  fn: suspend.fn(function*(control) {
    const screenshotPath = '/tmp/rentsoft.png';
    yield nightmare({
      width: 1600,
      height: 900
    })
      .goto('https://bo.rentsoft.ru')
      .type('#email', 'kro@velvica.com')
      .type('#password', '123456')
      .click('input[type="submit"]')
      .wait('body')
      .screenshot(screenshotPath)
      .end();
    yield control.file('screenshot1', screenshotPath, 'image/png');
    control.success();
  }),
  name: 'core.velvica'
};
