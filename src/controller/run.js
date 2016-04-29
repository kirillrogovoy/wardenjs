const {optionRequired} = require('../cli.js')
const {run, load, saveToDb} = require('../component/scenarios.js')
const loadConfig = require('../component/config.js').load
const suspend = require('suspend')
require('colors')
const os = require('os')
const fs = require('fs')
const mkdirp = require('mkdirp')
const rimraf = require('rimraf')
const crypto = require('crypto')
const path = require('path')
const mime = require('mime')

module.exports = function(commander) {
  optionRequired('path')
  optionRequired('config')

  const filePath = commander.path
  suspend.run(function*() {
    const configObj = yield loadConfig(commander.config)
    console.log(`Trying to load the scenario under the ${filePath}`)
    const scenario = load(filePath)
    console.log('Loaded! Trying to start the scenario...')
    if (typeof scenario.fn !== 'function') {
      console.error('Scenario should be a function!')
      /* eslint-disable no-process-exit */
      process.exit(1)
      /* eslint-enable no-process-exit */
    }

    function formattedPrint(message) {
      console.log('\n' + `===== ${message} =====`.bold + '\n')
    }

    formattedPrint(`Start: ${scenario.name} (${filePath})`)

    const result = yield run(scenario, configObj)

    const statusColor = result.status === 'success' ? 'green' : 'red'
    console.log(`Status: ${result.status[statusColor]}.`)

    const messageColor = {
      info: 'cyan',
      warning: 'yellow'
    }
    for (let type of ['info', 'warning']) {
      if (result[type].length) {
        console.log(`There was some ${type} messages:`)
        for (let message of result[type]) {
          console.log(`\t${message}`[messageColor[type]])
        }
      } else {
        console.log(`There weren\'t any ${type} messages`)
      }
    }

    console.log(`Final message: ${result.finalMessage.yellow}`)

    if (result.files.length) {
      const tmpDir = path.join(
        os.tmpdir(),
        'wardenjs_tmp',
        `${result.name}_${crypto.createHash('md5').update(filePath).digest('hex').substring(0, 6)}`
      )

      yield rimraf(tmpDir, suspend.resume())
      yield mkdirp(tmpDir, suspend.resume())
      for (let [i, file] of result.files.entries()) {
        // name includes left padding
        const filePathToSave = path
          .join(tmpDir, `${('00' + i).slice(-2)}_${file.name}.${mime.extension(file.media)}`)
        yield fs.writeFile(filePathToSave, file.content, suspend.resume())
      }

      console.log(
        `There were ${result.files.length} file(s) attached.`,
        `You can find them at: ${tmpDir.yellow}`
      )
    }

    formattedPrint(`End: ${scenario.name} (${filePath}). Took ${result.time} seconds.`)

    /**
     * If it's a child process, let's send the result to the parent
     * process through IPC
     */
    if (process.send) {
      yield process.send({
        type: 'SCENARIO_RESULT',
        data: result
      }, suspend.resume())
    }

    if (commander.save) {
      const db = yield require('../component/daemon/postgres.js')(configObj.postgres)
      yield saveToDb(db, result, filePath)
      db.close()
    }

    /* eslint-disable no-process-exit */
    process.exit(1)
    /* eslint-enable no-process-exit */
  })
}
