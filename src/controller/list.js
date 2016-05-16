const {optionRequired} = require('../cli.js')
const config = require('../component/config.js')
const suspend = require('suspend')

module.exports = function(commander) {
  optionRequired('config')
  suspend.run(function*() {
    let configObj = yield config.load(commander.config)
    config.validate(configObj)
    const scenarioFiles = config.getScenarioFiles(configObj.scenarioDirs)
    console.log(scenarioFiles.join('\n'))

    if (configObj.groups.length) {
      console.log('\nGroups:')
      const groups = config.getGroups(configObj.groups, scenarioFiles)
      for (let groupName of Object.keys(groups)) {
        console.log(`  ${groupName}`)
        for (let filePath of groups[groupName]) {
          console.log(`    ${filePath}`)
        }
      }
    }
  })
}
