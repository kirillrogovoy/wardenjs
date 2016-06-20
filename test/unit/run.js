const read = require('recursive-readdir-sync')

read(__dirname).map(require)
