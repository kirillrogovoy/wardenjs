const co = require('co')
const assert = require('assert')
const {check} = require('../../../src/util.js')
const run = require('../../../src/component/scenario/run.js')
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
