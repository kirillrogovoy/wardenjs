import path from 'path';

export default {
  fn: function wardenTest(control) {
    control.warning('one');
    control.warning('two');
    control.info('three');
    setTimeout(() => {
      control.file('dog', path.join(__dirname, '../../test/fixture/dog.png'), 'image/png')
        .then(() => control.success('I\'m OK!'))
        .catch((err) => control.failure(err));
    }, 1000);
  },
  name: 'core.wardenTest'
};
