const log = require('./log.js')

const listener = module.exports.listener = function listener(err) {
  log.error(err)
  /* eslint-disable no-process-exit */
  process.exit(1)
  /* eslint-enable no-process-exit */
}

module.exports.installErrorListener = function installErrorListener() {
  process.on('uncaughtException', listener)
}
