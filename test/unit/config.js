import suspend from 'suspend';
import assert from 'assert';
import path from 'path';
import * as config from '../../src/component/config.js';
import {check, root} from '../../src/util.js';

describe('config loading', () => {
  it(`file doesn't exist`, (done) => {
    suspend.run(function*() {
      yield config.load('js-from-the-moon.js');
    }, (err) => {
      check.error(err);
      done();
    });
  });
  
  it(`file exists, but isn't JSON`, (done) => {
    suspend.run(function*() {
      yield config.load('test/fixture/config-bad-json.json');
    }, (err) => {
      check.error(err);
      done();
    });
  });

  it(`file exists and is JSON`, (done) => {
    suspend.run(function*() {
      return yield config.load('test/fixture/config-correct.json');
    }, (err, config) => {
      check.null(err);
      check.object(config);
      done();
    });
  });
});

describe('config validating', () => {
  it('should be validated successfully', (done) => {
    suspend.run(function*() {
      config.validate(yield config.load('test/fixture/config-correct.json'));
    }, (err) => {
      check.null(err);
      done();
    });
  });
  
  it('should be failed', () => {
    assert.throws(() => {
      config.validate({test: 1});
    }, Error);
  });
});

describe('scenario files loading', () => {
  it('should detect scenarios correctly', () => {
    const files = config.getScenarioFiles(['../test/fixture/scenariosDir']);
    const dir = path.join(root, '../test');
    assert.deepEqual([
      dir + '/fixture/scenariosDir/file1.js',
      dir + '/fixture/scenariosDir/file2.js',
      dir + '/fixture/scenariosDir/file3.js'
    ], files);
  });
});

describe('groups loading', () => {
  it('sholud detect scenario files for the group correctly', () => {
    const files = config.getScenarioFiles(['../test/fixture/scenariosDir']);
    const dir = path.join(root, '../test');
    
    assert.deepEqual(config.getGroups({
      test: ['file1', 'file3']
    }, files), {
      test: [
        dir + '/fixture/scenariosDir/file1.js',
        dir + '/fixture/scenariosDir/file3.js'
      ]
    });
  });
});
