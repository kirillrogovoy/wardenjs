const {join} = require('path')
module.exports = require('require-tree')(join(__dirname, 'src/component'), {
  filter: (file) => !file.match(/react/)
})
