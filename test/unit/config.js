const path = require('path')
const config = require('../../src/component/config.js')
const {check, root} = require('../../src/util.js')
const test = require('blue-tape')

test(`config loading: file doesn't exist`, (t) => {
  return t.shouldFail(config.load('js-from-the-moon.js'), Error)
})

test(`config loading: file exists, but isn't JSON`, (t) => {
  return t.shouldFail(config.load('test/fixture/config-bad-json.json'), Error)
})

test(`config loading: file exists and is JSON`, () => {
  return config.load('test/fixture/config-correct.json').then(check.object)
})

test('config validating: should be validated successfully', () => {
  return config.load('test/fixture/config-correct.json').then(config.validate)
})

test('config validating: should be failed', (t) => {
  t.throws(() => {
    config.validate({test: 1})
  }, Error)
  t.end()
})

test('scenario files loading: should detect scenarios correctly', (t) => {
  const files = config.getScenarioFiles(['../test/fixture/scenariosDir'])
  const dir = path.join(root, '../test')
  t.deepEqual([
    dir + '/fixture/scenariosDir/file1.js',
    dir + '/fixture/scenariosDir/file2.js',
    dir + '/fixture/scenariosDir/file3.js',
    dir + '/fixture/scenariosDir/inner/file4.js'
  ], files)
  t.end()
})

test('groups loading: should detect scenario files for the group correctly', (t) => {
  const files = config.getScenarioFiles(['../test/fixture/scenariosDir'])
  const dir = path.join(root, '../test')

  t.deepEqual(config.getGroups({
    test: ['file1', 'file3']
  }, files), {
    test: [
      dir + '/fixture/scenariosDir/file1.js',
      dir + '/fixture/scenariosDir/file3.js'
    ]
  })
  t.end()
})
