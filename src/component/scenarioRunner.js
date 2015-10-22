import {check, root} from '../util.js';
import assert from 'assert';
import path from 'path';
import fs from 'fs';
import suspend from 'suspend';
import mime from 'mime';
import {fork} from 'child_process';

export function load(filePath) {
  let fullPath;
  if (path.isAbsolute(filePath)) {
    fullPath = path.normalize(filePath);
  } else {
    fullPath = path.join(process.cwd(), filePath);
  }
  
  return require(fullPath);
}

export function run(scenario, config) {
  check.function(scenario.fn);
  check.string(scenario.name);
  return new Promise((resolve) => {
    let timeoutId;
    const result = {
      finalMessage: null,
      warning: [],
      info: [],
      status: null,
      files: [],
      name: scenario.name
    };
    
    const control = {
      warning(text) {
        return message(text, 'warning');
      },
      info(text) {
        return message(text, 'info');
      },
      success(message = 'Passed') { return finish('success', message); },
      failure(message = 'Failed') { return finish('failure', message); },
      /** input can be either a path or content **/
      file: suspend.promise(function*(name, input, media) {
        if (result.status !== null) throw Error('Scenario is already finished!');
        let fileContent;
        
        check.string(name);

        if (typeof input === 'string') {
          if (!path.isAbsolute(input)) {
            throw Error('path should be absolute!');
          }
          const fileExists = yield fs.exists(input, suspend.resumeRaw());
          if (!fileExists) {
            throw Error(`File '${input}' doesn't exist!`);
          }
          
          fileContent = yield fs.readFile(input, suspend.resume());
        } else if (Buffer.prototype.isPrototypeOf(input)) {
          fileContent = input;
        } else {
          throw Error('input should be either string or buffer!');
        }

        check.string(media);
        const fileExtension = mime.extension(media);
        if (!fileExtension) {
          throw Error(`Unknown mime type: ${media}`);
        }
        
        result.files.push({
          name,
          media,
          content: fileContent
        });
        
        return true;
      })
    };

    function onError(err) {
      control.failure(
        'Scenario is broken! There was an unexpected error.\n' +
        `Stack: ${err.stack}\n`
      );
    }

    function onErrorHandler(err) {
      clearTimeout(timeoutId);
      onError(err);
    }
    
    function message(text, type) {
      if (result.status !== null) return false;
      check.string(text);
      result[type].push(text);
      return true;
    }

    function finish(status, finalMessage) {
      if (result.status !== null) return false;
      process.removeListener('uncaughtException', onErrorHandler);

      check.string(status);
      check.either.string(finalMessage).or.error(finalMessage);
      finalMessage = String(finalMessage);
      const statuses = ['success', 'failure'];
      assert(statuses.indexOf(status) !== -1, `Status can be only one of this values: ${statuses}`);
      
      clearTimeout(timeoutId);
      result.finalMessage = finalMessage;
      result.status = status;
      resolve(result);
      return true;
    }
    
    const timeoutSecs = 10;
    timeoutId = setTimeout(() => {
      control.failure(`TIMEOUT: ${timeoutSecs} seconds.`);
    }, timeoutSecs * 1000);

    process.on('uncaughtException', onErrorHandler);
    try {
      scenario.fn(control, config);
    } catch (e) {
      onError(e);
    }
  });
}

export function runForked(scenarioFile, configPath) {
  console.log(configPath);
  check.string(scenarioFile);
  return new Promise((resolve, reject) => {
    const child = fork(
      path.join(root, 'index.js'),
      ['run', '--path', scenarioFile, '--config', configPath], {
      silent: global.silentFork !== undefined ? global.silentFork : false
    });
    child.on('error', reject);
    child.on('message', (result) => {
      if (result.type === 'SCENARIO_RESULT') {
        child.kill();
        resolve(result.data);
      }
    });
  });

}

export function runGroup(scenarioFiles, configPath) {
  return Promise.all(scenarioFiles.map((s) => runForked(s, configPath)));
}
