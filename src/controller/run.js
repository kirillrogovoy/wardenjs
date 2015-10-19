import {optionRequired} from '../cli.js';
import {run, load} from '../component/scenarioRunner.js';
import suspend from 'suspend';
import 'colors';
import os from 'os';
import fs from 'fs';
import mkdirp from 'mkdirp';
import crypto from 'crypto';
import path from 'path';
import mime from 'mime';

export default function controllerRun(commander) {
  optionRequired('path');
  const filePath = commander.path;
  suspend.run(function*() {
    console.log(`Trying to load the scenario under the ${filePath}`);
    const scenario = load(filePath);
    console.log('Loaded! Trying to start the scenario...');
    if (typeof scenario !== 'function') {
      console.log('Scenario should be a function!');
      process.exit(1);
    }

    function formattedPrint(message) {
      console.log('\n' + `===== ${message} =====`.bold + '\n');
    }

    formattedPrint(`Start: ${filePath}`);
    
    const result = yield run(scenario);
    
    const statusColor = result.status === 'success' ? 'green' : 'red';
    console.log(`Status: ${result.status[statusColor]}.`);
    
    const messageColor = {
      info: 'cyan',
      warning: 'yellow'
    };
    for (let type of ['info', 'warning']) {
      if (result[type].length) {
        console.log(`There was some ${type} messages:`);
        for (let message of result[type]) {
          console.log(`\t${message}`[messageColor[type]]);
        }
      } else {
        console.log(`There wasn\'t any ${type} messages`);
      }
    }
    
    console.log(`Final message: ${result.finalMessage.blue}.`);

    if (result.files.length) {
      const tmpDir = path.join(
        os.tmpdir(),
        'wardenjs_tmp',
        crypto.createHash('md5').update(filePath).digest('hex')
      );

      yield mkdirp(tmpDir, suspend.resume());
      for (let file of result.files) {
        const filePath = path.join(tmpDir, `${file.name}.${mime.extension(file.media)}`);
        yield fs.writeFile(filePath, file.content, suspend.resume());
      }
      
      console.log(
        `There was ${result.files.length} file(s) attached.`,
        `You can find them at: ${tmpDir.blue}`
      );
    }
    
    formattedPrint(`End: ${filePath}`);
  });
}
