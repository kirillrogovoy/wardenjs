import commander from 'commander';
import packageJson from '../package.json';

function command(commander, name, description = '', args = null) {
  let commandText = name;
  if (args) commandText += ' ' + args;
  
  commander
    .command(commandText)
    .description(description)
    .action(function() {
      require(`./controller/${name}.js`)(commander, ...arguments);
    });
}

export function optionRequired(name) {
  if (commander[name]) {
    return;
  }
  console.log(`Please, specify the option "${name}"! (see --help)`);
  process.exit(1);
}

commander.version(packageJson.version);
commander.option('--config <config>', 'Path to the config file');
commander.option('--path <path>', 'Path to the scenario file');
commander.option('--group <name>', 'The name of the group of scenarios to run');
commander.option('--run-mode <mode>', 'Mode of running multiple scenarios. async (default) | sync');
commander.option('--save', 'Save the result(s) to the database');
command(commander, 'check', 'Check whether all is ok');
command(commander, 'list-scenarios', 'Get list of the all available scenarios');
command(commander, 'run', 'Run a scenario and print the results');
command(commander, 'run-group', 'Run a group of scenarios and print the results');
command(commander, 'daemon',
  'Launch a daemon to run scenarios according to a schedule and run web-server to see results');

const program = commander.parse(process.argv);
if (typeof program.args[0] !== 'object') {
  console.log('Wrong usage. Please, check --help');
  process.exit(1);
}

if (!process.argv.slice(2).length) {
  commander.outputHelp();
}

