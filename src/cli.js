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
commander.option('-c, --config <path>', 'Path to the config file');
commander.option('-p, --path <path>', 'Path to the scenario file');
command(commander, 'check', 'Check whether all is ok');
command(commander, 'list-scenarios', 'Get list of the all available scenarios');
command(commander, 'run', 'Run a scenario and print the results');
const program = commander.parse(process.argv);
if (typeof program.args[0] !== 'object') {
  console.log('Wrong usage. Please, check --help');
  process.exit(1);
}

if (!process.argv.slice(2).length) {
  commander.outputHelp();
}

