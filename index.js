const fs = require('fs')
const path = require('path')

const componentsPath = path.join(__dirname, 'src/component')
fs.readdirSync(componentsPath)
  .filter((entity) => fs.lstatSync(path.join(componentsPath, entity)).isDirectory())
  .forEach((dirName) => {
    module.exports[dirName] = require(path.join(componentsPath, dirName, 'index.js'))
  })
