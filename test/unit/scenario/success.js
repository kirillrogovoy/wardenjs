const co = require('co')
const assert = require('assert')
const path = require('path')
const fs = require('mz/fs')
const {check, root} = require('../../../src/util.js')
const {run} = require('../../../src/component/scenario/index.js')
const {saveToDb} = require('../../../src/component/result/index.js')
const test = require('blue-tape')

test('scenarios runner: should run on empty scenario', () => {
  const warningMessage = 'warning, dude'
  const infoMessage = 'info, dude'
  return co(function*() {
    const result = yield run({ fn: co.wrap((control) => {
      control.warning(warningMessage)
      control.info(infoMessage)
      return ['success']
    }), name: 'test' })

    check.object(result)
    assert.deepEqual([warningMessage], result.warning)
    assert.deepEqual([infoMessage], result.info)
    assert.equal('success', result.status)
  })
})

test('database: should be saved to DB', (t) => {
  return co(function*() {
    const db = yield require(
      '../../../src/component/daemon/postgres.js'
    )(JSON.parse(fs.readFileSync(path.join(root, '../test/fixture/db-creds.json'))))
    const result = yield run({ fn: co.wrap(function*(control) {
      control.warning('warning1')
      control.info('info1')
      control.info('info2')
      return ['success']
    }), name: 'test' })

    yield saveToDb(db, result, '/tmp/stub.js')

    const record = yield db.models.result.findOne()
    t.equal('success', record.status)
    t.deepEqual(['warning1'], record.warning)
    t.deepEqual(['info1', 'info2'], record.info)
  })
})

test('scenario runner: test stream', (t) => {
  return co(function*() {
    const outStream = require('stream').Writable()
    let output = ''
    outStream._write = (text, enc, done) => {
      output += text
      done()
    }
    const result = yield run({ fn: co.wrap(function*(control) {
      control.stream.write('abc ')
      control.stream.write('xyz')
      return ['success']
    }), name: 'test' }, outStream)

    t.equal('success', result.status)
    t.equal('abc xyz', output)
  })
})
