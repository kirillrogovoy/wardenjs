const suspend = require('suspend')
const assert = require('assert')
const path = require('path')
const fs = require('fs')
const {check, root} = require('../../src/util.js')
const {run, runForked, runGroup, saveToDb} = require('../../src/component/scenarios.js')
const test = require('blue-tape')

const fixtureDir = path.join(root, '../test/fixture')
const fixtureFile = path.join(fixtureDir, '/dog.png')

global.silentFork = true

test('should fail on bad input', (t) => {
  return t.shouldFail(suspend.promise(function*() {
    yield run('garbage')
  })(), Error)
})

test('scenarios runner: should run on empty scenario', (t) => {
  const warningMessage = 'warning, dude'
  const infoMessage = 'info, dude'
  suspend.run(function*() {
    const result = yield run({ fn: (control) => {
      control.warning(warningMessage)
      control.info(infoMessage)
      control.success()
    }, name: 'test' })

    check.object(result)
    assert.deepEqual([warningMessage], result.warning)
    assert.deepEqual([infoMessage], result.info)
    assert.equal('success', result.status)
  }, (err) => {
    check.null(err)
    t.end()
  })
})

test('scenarios runner: should run correctly on double finish', (t) => {
  suspend.run(function*() {
    const result = yield run({ fn: (control) => {
      control.failure()

      // scenario has finished, further control calls are ignored
      control.success()
      control.warning('test')
    }, name: 'test' })

    assert.equal('failure', result.status)
    assert.deepEqual([], result.warning)
  }, (err) => {
    check.null(err)
    t.end()
  })
})

test('scenarios runner: should run with bad async scenario', (t) => {
  return suspend.promise(function*() {
    const result = yield run({ fn: suspend.promise(function*(control) {
      setTimeout(() => {
        control.success()
      }, 10)
      throw Error('error')
    }), name: 'test' })

    t.assert(result.status, 'failure')
  })()
})

test('scenarios runner: scenario with an error should fail', (t) => {
  return suspend.promise(function*() {
    const error = Error('oh my god')
    const result = yield run({ fn: suspend.promise(function*() {
      throw error
    }), name: 'test' })
    t.equal('failure', result.status)
    t.true(result.finalMessage.startsWith('Scenario is broken!'))
  })()
})

test('scenarios runner: scenario with a non-error promise should fail', (t) => {
  return suspend.promise(function*() {
    const result = yield run({ fn: () => Promise.resolve(true), name: 'test' })
    t.equal('failure', result.status)
    t.true(result.finalMessage.startsWith('Scenario returned'), 'Message should be appropriate')
  })()
})

test('scenarios runner: files: bad input, invalid type', () => {
  return suspend.promise(function*() {
    yield run({ fn: suspend.promise(function*(control) {
      let result = null
      try {
        result = yield control.file('test', 1, 'application/octet-stream')
      } catch (e) {
        check.error(e)
      } finally {
        check.null(result)
        control.success()
      }
    }), name: 'test' })
  })()
})

test('scenarios runner: files: bad input, non-absolute path', () => {
  return suspend.promise(function*() {
    yield run({ fn: suspend.promise(function*(control) {
      let result = null
      try {
        result = yield control.file('test', 'tmp/non-existing-file', 'application/octet-stream')
      } catch (e) {
        check.error(e)
      } finally {
        check.null(result)
        control.success()
      }
    }), name: 'test' })
  })()
})

test('scenarios runner: files: bad input, non-existing file', () => {
  return suspend.promise(function*() {
    yield run({ fn: suspend.promise(function*(control) {
      let result = null
      try {
        result = yield control.file('test', '/tmp/non-existing-file', 'application/octet-stream')
      } catch (e) {
        check.error(e)
      } finally {
        check.null(result)
        control.success()
      }
    }), name: 'test' })
  })()
})

test('scenarios runner: files: bad media', () => {
  return suspend.promise(function*() {
    yield run({ fn: suspend.promise(function*(control) {
      let result = null
      try {
        result = yield control.file('test', fixtureFile, 'application/bad-type')
      } catch (e) {
        check.error(e)
      } finally {
        check.null(result)
        control.success()
      }
    }), name: 'test' })
  })()
})

test('scenarios runner: files: good input, file path', (t) => {
  return suspend.promise(function*() {
    const media = 'image/png'
    const result = yield run({ fn: suspend.promise(function*(control) {
      const savingResult = yield control.file('test', fixtureFile, media)
      t.assert(savingResult)
      return control.success()
    }), name: 'test' })
    t.equal(result.files.length, 1)
    t.equal(result.files[0].name, 'test')
    t.equal(result.files[0].media, media)
    t.assert(Buffer.prototype.isPrototypeOf(result.files[0].content))
  })()
})

test('scenarios runner: files: good input, buffer', (t) => {
  return suspend.promise(function*() {
    const media = 'image/png'
    const result = yield run({ fn: suspend.promise(function*(control) {
      const content = yield fs.readFile(fixtureFile, suspend.resume())
      const savingResult = yield control.file('test', content, media)
      t.assert(savingResult)
      control.success()
    }), name: 'test' })
    t.equal(result.files.length, 1)
    t.equal(result.files[0].name, 'test')
    t.equal(result.files[0].media, media)
    t.assert(Buffer.prototype.isPrototypeOf(result.files[0].content))
  })()
})

const scenarioFiles = [
  path.join(root, '../test/fixture/scenariosDir/file1.js'),
  path.join(root, '../test/fixture/scenariosDir/file2.js')
]
const configPath = 'test/fixture/config-correct.json'

test('parallel execution: should run forked scenario', (t) => {
  suspend.run(function*() {
    const result = yield runForked(scenarioFiles[0], configPath)

    check.object(result)
    assert.equal('success', result.status)
  }, (err) => {
    check.null(err)
    t.end()
  })
})

test('parallel execution: should run scenario group', (t) => {
  suspend.run(function*() {
    const results = yield runGroup(scenarioFiles, configPath)

    check.array.of.object(results)
    assert.equal('success', results[0].status)
    assert.equal('core.fixture.file1', results[0].name)
    assert.equal('success', results[1].status)
    assert.equal('core.fixture.file2', results[1].name)
  }, (err) => {
    check.null(err)
    t.end()
  })
})

test('database: should be saved to DB', () => {
  return suspend.promise(function*() {
    const db = yield require(
      '../../src/component/daemon/postgres.js'
    )(JSON.parse(fs.readFileSync(path.join(root, '../test/fixture/db-creds.json'))))
    const result = yield run({ fn: (control) => {
      control.warning('warning1')
      control.info('info1')
      control.info('info2')
      control.success()
    }, name: 'test' })

    yield saveToDb(db, result, '/tmp/stub.js')

    const record = yield db.models.result.findOne()
    assert.equal('success', record.status)
    assert.deepEqual(['warning1'], record.warning)
    assert.deepEqual(['info1', 'info2'], record.info)
  })()
})
