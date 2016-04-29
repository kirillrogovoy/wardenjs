const commander = require('commander')
const packageJson = require('../package.json')

/**
 * A helper function to reduce typing
 *
 * @param {object} c commander instance
 * @param {string} name
 * @param {string} description
 * @param {string} args
 *
 * @returns {object} commander instance
 */
function command(c, name, description = '', args = null) {
  let commandText = name
  if (args) {
    commandText += ' ' + args
  }

  return c
    .command(commandText)
    .description(description)
    .action(function() {
      require(`./controller/${name}.js`)(c, ...arguments)
    })
}

module.exports.optionRequired = function optionRequired(name) {
  if (commander[name]) {
    return
  }
  console.log(`Please, specify the option "${name}"! (see --help)`)
  /* eslint-disable no-process-exit */
  process.exit(1)
  /* eslint-enable no-process-exit */
}

commander.version(packageJson.version)
commander.option('--config <config>', 'Path to the config file')
commander.option('--path <path>', 'Path to the scenario file')
commander.option('--group <name>', 'The name of the group of scenarios to run')
commander.option('--run-mode <mode>', 'Mode of running multiple scenarios. async (default) | sync')
commander.option('--save', 'Save the result(s) to the database')
command(commander, 'list', 'Get list of the all available scenarios')
command(commander, 'run', 'Run a scenario and print the results')
command(commander, 'run-group', 'Run a group of scenarios and print the results')
command(commander, 'daemon',
  'Launch a daemon to run scenarios according to a schedule and run web-server to see results')

const program = commander.parse(process.argv)
if (typeof program.args[0] !== 'object') {
  console.log('Wrong usage. Please, check --help')
  /* eslint-disable no-process-exit */
  process.exit(1)
  /* eslint-enable no-process-exit */
}

if (!process.argv.slice(2).length) {
  commander.outputHelp()
}

