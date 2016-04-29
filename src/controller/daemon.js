const {optionRequired} = require('../cli.js')
const {load: configLoad, getScenarioFiles, getGroups, validate} = require('../component/config.js')
const suspend = require('suspend')
const {runForked, saveToDb} = require('../component/scenarios.js')
const webServer = require('../component/daemon/web-server/index.js')
const log = require('../log.js')

const runGroup = suspend.promise(function*(group, configPath, db, groupName) {
  for (let file of group) {
    const result = yield runForked(file, configPath)
    yield saveToDb(db, result, file, groupName)
  }
  return true
})

function setupIntervals(groupsFiles, groupsIntervals, configPath, db) {
  for (let groupName of groupsFiles.keys()) {
    const interval = groupsIntervals[groupName]
    console.log(`Setting group '${groupName}' to be executed one at ${interval} seconds.`)
    setInterval(
      runGroup.bind(null, groupsFiles[groupName], configPath, db, groupName),
      interval * 1000 // s to ms
    )
  }
}

function initialRun(groups, configPath, db) {
  const promises = []

  for (let groupName of groups.keys()) {
    promises.push(runGroup(groups[groupName], configPath, db, groupName))
  }

  return Promise.all(promises)
}

module.exports = function watch(commander) {
  optionRequired('config')
  suspend.run(function*() {
    const configObj = yield configLoad(commander.config)
    validate(configObj)
    const db = yield require('../component/daemon/postgres.js')(configObj.postgres)

    const groupsIntervals = configObj.daemon.intervals.groups
    const groupsFiles = getGroups(configObj.groups, getScenarioFiles(configObj.scenarioDirs))
    for (let group in groupsIntervals) {
      if (!groupsIntervals.hasOwnProperty(group)) {
        delete groupsFiles[group]
      }
    }

    log.info('Setting a web-server.')
    yield webServer.setupServer(configObj, db)

    log.info('Files are ready, settings intervals.')
    setupIntervals(groupsFiles, groupsIntervals, commander.config, db)

    log.info('Intervals were set. Do an initial scenarios run.')
    yield initialRun(groupsFiles, commander.config, db)
  })
}

