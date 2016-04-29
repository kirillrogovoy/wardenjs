module.exports = {
  fn: function wardenTest(control) {
    control.warning('one')
    control.warning('two')
    control.info('three')
    control.success()
  },
  name: 'core.fixture.file1'
}

