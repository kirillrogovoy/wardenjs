const bunyan = require('bunyan')
const path = require('path')
const PrettyStream = require('bunyan-prettystream')

const prettyStdOut = new PrettyStream({ mode: 'dev' })
prettyStdOut.pipe(process.stdout)

module.exports = bunyan.createLogger({
  name: 'APP',
  streams: [{
    level: 'trace',
    stream: prettyStdOut
  }, {
    level: 'info',
    path: path.join(__dirname, '../.log/general.log'),
    type: 'rotating-file',
    period: '1d',
    count: 3
  }]
})
