const test = require('blue-tape')
const {create} = require('../../../src/component/webServer/store.js')
const {is, fromJS} = require('immutable')

test('web-server - store: POST_SCENARIO, add new value', (t) => {
  const store = create()
  t.assert(is(store.getState(), fromJS({scenarios: []})), 'Initial state should be declared')
  store.dispatch({
    type: 'POST_SCENARIO',
    scenario: {a: 1},
    id: 1
  })
  t.deepEqual(
    store.getState().toJS(),
    {scenarios: [{a: 1, __id: 1}]},
    'POST_SCENARIO should add a new one'
  )
  t.end()
})

test('web-server - store: POST_SCENARIO fails on bad action', (t) => {
  const store = create()
  t.throws(() => {
    store.dispatch({
      type: 'POST_SCENARIO'
    })
  }, /No action\.scenario supplied/)
  t.end()
})

test('web-server - store: POST_SCENARIO, scenarioLimit works', (t) => {
  const store = create(1) // scenariosLimit = 1

  store.dispatch({
    type: 'POST_SCENARIO',
    scenario: {a: 1},
    id: 1
  })
  t.deepEqual(
    store.getState().toJS(),
    {scenarios: [{a: 1, __id: 1}]},
    'POST_SCENARIO should add a new one'
  )

  store.dispatch({
    type: 'POST_SCENARIO',
    scenario: {b: 2},
    id: 2
  })
  t.deepEqual(
    store.getState().toJS(),
    {scenarios: [{b: 2, __id: 2}]},
    'The old value should be gone'
  )
  t.end()
})

test('web-server - store: POST_SCENARIO, alter existing scenario', (t) => {
  const store = create()

  store.dispatch({
    type: 'POST_SCENARIO',
    scenario: {a: 1},
    id: 1
  })
  t.deepEqual(
    store.getState().toJS(),
    {scenarios: [{a: 1, __id: 1}]},
    'POST_SCENARIO should add a new one'
  )

  store.dispatch({
    type: 'POST_SCENARIO',
    scenario: {b: 2},
    id: 1
  })
  t.deepEqual(
    store.getState().toJS(),
    {scenarios: [{b: 2, __id: 1}]},
    'The new value should replace the old one'
  )
  t.end()
})
