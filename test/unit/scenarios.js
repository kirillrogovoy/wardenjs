import suspend from 'suspend';
import assert from 'assert';
import path from 'path';
import fs from 'fs';
import {check, root} from '../../src/util.js';
import {run, runForked, runGroup, saveToDb} from '../../src/component/scenarios.js';

const fixtureDir = path.join(root, '../test/fixture');
const fixtureFile = path.join(fixtureDir, '/dog.png');

global.silentFork = true;

describe('scenarios runner', () => {
  it('should fail on bad input', () => {
    assert.throws(() => {
      run('garbage');
    }, Error);
  });

  it('should run on empty scenario', (done) => {
    const warningMessage = 'warning, dude';
    const infoMessage = 'info, dude';
    suspend.run(function*() {
      const result = yield run({ fn: (control) => {
        control.warning(warningMessage);
        control.info(infoMessage);
        control.success();
      }, name: 'test' });

      check.object(result);
      assert.deepEqual([warningMessage], result.warning);
      assert.deepEqual([infoMessage], result.info);
      assert.strictEqual('success', result.status);
    }, (err) => {
      check.null(err);
      done();
    });
  });

  it('should run correctly on double finish', (done) => {
    suspend.run(function*() {
      const result = yield run({ fn: (control) => {
        control.failure();

        // scenario has finished, further control calls are ignored
        control.success();
        control.warning('test');
      }, name: 'test' });

      assert.strictEqual('failure', result.status);
      assert.deepEqual([], result.warning);
    }, (err) => {
      check.null(err);
      done();
    });
  });

  it('should run with bad async scenario', (done) => {
    suspend.run(function*() {
      const result = yield run({ fn: (control) => {
        setTimeout(() => {
          control.success();
        }, 10);
        throw Error('error');
      }, name: 'test' });

      assert(result.status, 'failure');
      return result;
    }, (err) => {
      check.null(err);
      done();
    });
  });

  it('scenario with an error should fail', (done) => {
    suspend.run(function*() {
      const error = Error('oh my god');
      const result = yield run({ fn: () => {
        throw error;
      }, name: 'test' });
      assert.strictEqual('failure', result.status);
      assert(result.finalMessage.startsWith('Scenario is broken!'));
    }, (err) => {
      check.null(err);
      done();
    });
  });

  it('files: bad input, invalid type', (done) => {
    suspend.run(function*() {
      yield run({ fn: (control) => {
        control.file('test', 1, 'application/octet-stream')
          .catch((err) => {
            check.error(err);
            done();
          });
      }, name: 'test' });
    });
  });

  it('files: bad input, non-absolute path', (done) => {
    suspend.run(function*() {
      yield run({ fn: (control) => {
        control.file('test', 'tmp/non-existing-file', 'application/octet-stream')
          .catch((err) => {
            check.error(err);
            done();
          });
      }, name: 'test' });
    });
  });

  it('files: bad input, non-existing file', (done) => {
    suspend.run(function*() {
      yield run({ fn: (control) => {
        control.file('test', '/tmp/non-existing-file', 'application/octet-stream')
          .catch((err) => {
            check.error(err);
            done();
          });
      }, name: 'test' });
    });
  });

  it('files: bad media', (done) => {
    suspend.run(function*() {
      yield run({ fn: (control) => {
        control.file('test', fixtureFile, 'application/bad-type')
          .catch((err) => {
            check.error(err);
            done();
          });
      }, name: 'test' });
    });
  });

  it('files: good input, file path', (done) => {
    const media = 'image/png';
    suspend.run(function*() {
      const result = yield run({ fn: suspend.fn(function*(control) {
        const savingResult = yield control.file('test', fixtureFile, media);
        assert(savingResult);
        control.success();
      }), name: 'test' });
      assert.equal(result.files.length, 1);
      assert.equal(result.files[0].name, 'test');
      assert.equal(result.files[0].media, media);
      assert(Buffer.prototype.isPrototypeOf(result.files[0].content));
      done();
    });
  });

  it('files: good input, buffer', (done) => {
    const media = 'image/png';
    suspend.run(function*() {
      const result = yield run({ fn: suspend.fn(function*(control) {
        const content = yield fs.readFile(fixtureFile, suspend.resume());
        const savingResult = yield control.file('test', content, media);
        assert(savingResult);
        control.success();
      }), name: 'test' });
      assert.equal(result.files.length, 1);
      assert.equal(result.files[0].name, 'test');
      assert.equal(result.files[0].media, media);
      assert(Buffer.prototype.isPrototypeOf(result.files[0].content));
      done();
    });
  });

});

const scenarioFiles = [
  path.join(root, '../test/fixture/scenariosDir/file1.js'),
  path.join(root, '../test/fixture/scenariosDir/file2.js')
];
const configPath = 'test/fixture/config-correct.json';

describe('parallel execution', () => {
  it('should run forked scenario', (done) => {
    suspend.run(function*() {
      const result = yield runForked(scenarioFiles[0], configPath);

      check.object(result);
      assert.strictEqual('success', result.status);
    }, (err) => {
      check.null(err);
      done();
    });
  });

  it('should run scenario group', (done) => {
    suspend.run(function*() {
      const results = yield runGroup(scenarioFiles, configPath);

      check.array.of.object(results);
      assert.strictEqual('success', results[0].status);
      assert.strictEqual('core.fixture.file1', results[0].name);
      assert.strictEqual('success', results[1].status);
      assert.strictEqual('core.fixture.file2', results[1].name);
    }, (err) => {
      check.null(err);
      done();
    });
  });
});

describe('database', () => {
  it('should be saved to DB', (done) => {
    suspend.run(function*() {
      const db = yield require(
        '../../src/component/daemon/postgres.js'
      )(JSON.parse(fs.readFileSync(path.join(root, '../test/fixture/db-creds.json'))));
      const result = yield run({ fn: (control) => {
        control.warning('warning1');
        control.info('info1');
        control.info('info2');
        control.success();
      }, name: 'test' });

      yield saveToDb(db, result, '/tmp/stub.js');

      const record = yield db.models.result.findOne();
      assert.strictEqual('success', record.status);
      assert.deepEqual(['warning1'], record.warning);
      assert.deepEqual(['info1', 'info2'], record.info);
      done();
    });
  });
});
