const co = require('co')
const path = require('path')
const fs = require('mz/fs')
const {check, root} = require('../../../src/util.js')
const {run} = require('../../../src/component/scenario/index.js')
const test = require('blue-tape')

const fixtureDir = path.join(root, '../test/fixture')
const fixtureFile = path.join(fixtureDir, 'dog.png')

test('scenarios runner: files: bad input, invalid type', (t) => {
  return co(function*() {
    const result = yield run({ fn: co.wrap(function*(control) {
      let r = null
      try {
        r = yield control.file('test', 1, 'application/octet-stream')
      } catch (e) {
        check.instance(e, Error)
      } finally {
        check.null(r)
      }
      return ['success']
    }), name: 'test' })
    t.equal('success', result.status)
  })
})

test('scenarios runner: files: bad input, non-absolute path', (t) => {
  return co(function*() {
    const result = yield run({ fn: co.wrap(function*(control) {
      let r = null
      try {
        r = yield control.file('test', 'tmp/non-existing-file', 'application/octet-stream')
      } catch (e) {
        check.instance(e, Error)
      } finally {
        check.null(r)
      }
      return ['success']
    }), name: 'test' })
    t.equal('success', result.status)
  })
})

test('scenarios runner: files: bad input, non-existing file', (t) => {
  return co(function*() {
    const result = yield run({ fn: co.wrap(function*(control) {
      let r = null
      try {
        r = yield control.file('test', '/tmp/non-existing-file', 'application/octet-stream')
      } catch (e) {
        check.instance(e, Error)
      } finally {
        check.null(r)
      }
      return ['success']
    }), name: 'test' })
    t.equal('success', result.status)
  })
})

test('scenarios runner: files: bad media', (t) => {
  return co(function*() {
    const result = yield run({ fn: co.wrap(function*(control) {
      let r = null
      try {
        r = yield control.file('test', fixtureFile, 'application/bad-type')
      } catch (e) {
        check.instance(e, Error)
      } finally {
        check.null(r)
      }
      return ['success']
    }), name: 'test' })
    t.equal('success', result.status)
  })
})

test('scenarios runner: files: good input, file path', (t) => {
  return co(function*() {
    const media = 'image/png'
    const result = yield run({ fn: co.wrap(function*(control) {
      const savingResult = yield control.file('test', fixtureFile, media)
      t.assert(savingResult)
      return ['success']
    }), name: 'test' })
    t.equal('success', result.status)
    t.equal(result.files.length, 1)
    t.equal(result.files[0].name, 'test')
    t.equal(result.files[0].media, media)
    t.assert(Buffer.prototype.isPrototypeOf(result.files[0].content))
  })
})

test('scenarios runner: files: good input, buffer', (t) => {
  return co(function*() {
    const media = 'image/png'
    const result = yield run({ fn: co.wrap(function*(control) {
      const content = yield fs.readFile(fixtureFile)
      const savingResult = yield control.file('test', content, media)
      t.assert(savingResult)
      return ['success']
    }), name: 'test' })
    t.equal('success', result.status)
    t.equal(result.files.length, 1)
    t.equal(result.files[0].name, 'test')
    t.equal(result.files[0].media, media)
    t.assert(Buffer.prototype.isPrototypeOf(result.files[0].content))
  })
})
