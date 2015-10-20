export default {
  fn: function wardenTest() {
    setTimeout(() => {
      throw Error('test');
    }, 10);
  },
  name: 'core.wardenTest2'
};
