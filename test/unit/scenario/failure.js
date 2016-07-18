const co = require('co')
const run = require('../../../src/component/scenario/run.js')
const test = require('blue-tape')

test('should fail on bad input', (t) => {
  return t.shouldFail(co(function*() {
    yield run('garbage')
  }), Error)
})

test('scenarios runner: should run with bad async scenario', (t) => {
  return co(function*() {
    const result = yield run({ fn: co.wrap(function*() {
      yield new Promise((resolve) => {
        setTimeout(() => {
          resolve()
        }, 10)
      })
      throw Error('error')
    }), name: 'test' })

    t.assert('failure', result.status)
    t.true(result.finalMessage.indexOf('Error: error') !== -1)
  })
})

test('scenarios runner: should run with an async error', (t) => {
  return co(function*() {
    const result = yield run({ fn: co.wrap(function*() {
      setImmediate(() => {
        throw Error('async error')
      })
      yield new Promise((resolve) => {
        setTimeout(() => {
          resolve()
        }, 10)
      })
      return ['success']
    }), name: 'test' })

    t.assert('failure', result.status)
    t.true(result.finalMessage.indexOf('Error: async error') !== -1)
  })
})

test('scenarios runner: scenario with an error should fail', (t) => {
  return co(function*() {
    const error = Error('oh my god')
    const result = yield run({ fn: co.wrap(function*() {
      throw error
    }), name: 'test' })
    t.equal('failure', result.status)
    t.true(result.finalMessage.indexOf('Error: oh my god') !== -1)
  })
})

test('scenarios runner: both sync and async errors', (t) => {
  return co(function*() {
    const result = yield run({ fn: co.wrap(function*() {
      setImmediate(() => {
        throw Error('async')
      })
      yield new Promise((resolve) => {
        setTimeout(() => {
          resolve()
        }, 10)
      })
      throw Error('sync')
    }), name: 'test' })
    t.equal('failure', result.status)
    t.true(result.finalMessage.indexOf('async') !== -1)
  })
})

test('scenarios runner: bad resolve value', (t) => {
  return co(function*() {
    const result = yield run({ fn: co.wrap(function*() {
      return 'garbage'
    }), name: 'test' })
    t.equal('failure', result.status)
    t.true(result.finalMessage.indexOf('Wrong scenario result!') !== -1)
  })
})
