import suspend from 'suspend';
import assert from 'assert';
import path from 'path';
import fs from 'fs';
import {check, root} from '../../src/util.js';
import {run} from '../../src/component/scenarioRunner.js';

const fixtureDir = path.join(root, '../test/fixture');
const fixtureFile = path.join(fixtureDir, '/dog.png');

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
      const result = yield run((control) => {
        control.warning(warningMessage);
        control.info(infoMessage);
        control.success();
      });
      
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
      const result = yield run((control) => {
        control.failure();
       
        // scenario has finished, further control calls are ignored
        control.success();
        control.warning('test');
      });

      assert.strictEqual('failure', result.status);
      assert.deepEqual([], result.warning);
    }, (err) => {
      check.null(err);
      done();
    });
  });

  it('should run with bad async scenario', (done) => {
    suspend.run(function*() {
      const result = yield run((control) => {
        setTimeout(() => {
          control.success();
        }, 10);
        throw Error('error');
      });

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
      const result = yield run(() => {
        throw error;
      });
      assert.strictEqual('failure', result.status);
      assert(result.finalMessage.startsWith('Scenario is broken!'));
    }, (err) => {
      check.null(err);
      done();
    });
  });
  
  it('files: bad input, invalid type', (done) => {
    suspend.run(function*() {
      yield run((control) => {
        control.file('test', 1, 'application/octet-stream')
          .catch((err) => {
            check.error(err);
            done();
          });
      });
    });
  });

  it('files: bad input, non-absolute path', (done) => {
    suspend.run(function*() {
      yield run((control) => {
        control.file('test', 'tmp/non-existing-file', 'application/octet-stream')
          .catch((err) => {
            check.error(err);
            done();
          });
      });
    });
  });

  it('files: bad input, non-existing file', (done) => {
    suspend.run(function*() {
      yield run((control) => {
        control.file('test', '/tmp/non-existing-file', 'application/octet-stream')
          .catch((err) => {
            check.error(err);
            done();
          });
      });
    });
  });

  it('files: bad media', (done) => {
    suspend.run(function*() {
      yield run((control) => {
        control.file('test', fixtureFile, 'application/bad-type')
          .catch((err) => {
            check.error(err);
            done();
          });
      });
    });
  });

  it('files: good input, file path', (done) => {
    const media = 'image/png';
    suspend.run(function*() {
      const result = yield run(suspend.fn(function*(control) {
        const savingResult = yield control.file('test', fixtureFile, media);
        assert(savingResult);
        control.success();
      }));
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
      const result = yield run(suspend.fn(function*(control) {
        const content = yield fs.readFile(fixtureFile, suspend.resume());
        const savingResult = yield control.file('test', content, media);
        assert(savingResult);
        control.success();
      }));
      assert.equal(result.files.length, 1);
      assert.equal(result.files[0].name, 'test');
      assert.equal(result.files[0].media, media);
      assert(Buffer.prototype.isPrototypeOf(result.files[0].content));
      done();
    });
  });
});
