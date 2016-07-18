const {createStore, compose} = require('redux')
const {fromJS} = require('immutable')

module.exports.create = (scenariosLimit = 30) => {
  return createStore(compose(
    postScenario
  ), getInitialState())

  function postScenario(state, action) {
    if (action.type === 'POST_SCENARIO') {
      if (!action.scenario) {
        throw Error('No action.scenario supplied!')
      }
      if (!action.id) {
        throw Error('No action.id supplied!')
      }

      let scenarios = state.get('scenarios')
      const existingScenarioKey = scenarios.findKey((s) => s.get('__id') === action.id)

      const newScenario = fromJS(action.scenario).set('__id', action.id)
      if (existingScenarioKey !== undefined) {
        scenarios = scenarios.set(existingScenarioKey, newScenario)
      } else {
        scenarios = scenarios.push(newScenario)
      }

      if (scenarios.size > scenariosLimit) {
        scenarios = scenarios.shift()
      }

      return state.set('scenarios', scenarios)
    }

    return state
  }
}

function getInitialState() {
  return fromJS({
    scenarios: []
  })
}
