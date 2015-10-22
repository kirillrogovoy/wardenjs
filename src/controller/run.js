import {optionRequired} from '../cli.js';
import {run, load} from '../component/scenarioRunner.js';
import {load as loadConfig} from '../component/config.js';
import suspend from 'suspend';
import 'colors';
import os from 'os';
import fs from 'fs';
import mkdirp from 'mkdirp';
import crypto from 'crypto';
import path from 'path';
import mime from 'mime';

export default function (commander) {
  optionRequired('path');
  if (commander.save) {
    optionRequired('config');
  }
  const filePath = commander.path;
  suspend.run(function*() {
    console.log(`Trying to load the scenario under the ${filePath}`);
    const scenario = load(filePath);
    console.log('Loaded! Trying to start the scenario...');
    if (typeof scenario.fn !== 'function') {
      console.error('Scenario should be a function!');
      process.exit(1);
    }

    function formattedPrint(message) {
      console.log('\n' + `===== ${message} =====`.bold + '\n');
    }

    formattedPrint(`Start: ${scenario.name} (${filePath})`);
    
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
        `There were ${result.files.length} file(s) attached.`,
        `You can find them at: ${tmpDir.blue}`
      );
    }
    
    formattedPrint(`End: ${scenario.name} (${filePath})`);
    
    /**
     * If it's a child process, let's send the result to the parent
     * process through IPC
     */
    if (process.send) {
      process.send({
        type: 'SCENARIO_RESULT',
        data: result
      });
    }
    
    if (commander.save) {
      const configObj = yield loadConfig(commander.config);
      const db = yield require('../component/daemon/postgres.js')(configObj.postgres);

      const transaction = yield db.transaction();
      const resultRow = yield db.models.result.create({
        filePath,
        name: result.name,
        warning: result.warning,
        info: result.info,
        status: result.status,
        finalMessage: result.finalMessage
      }, {transaction});
      if (result.files.length) {
        yield Promise.all(result.files.map((file) => {
          return db.models.file.create(
            Object.assign({result_id: resultRow.id}, file),
            { transaction }
          );
        }));
      }
      transaction.commit();
      db.close();
    }
  });
}
