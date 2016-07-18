/* eslint-disable no-invalid-this */
const koaApp = require('koa')()
const koaRouter = require('koa-router')()
const koaBody = require('koa-body')({
  jsonLimit: '1024mb'
})
const path = require('path')
const {create} = require('./store.js')
const {readFile} = require('mz/fs')

module.exports = function(options = {port: 9998, limit: 30}) {
  const state = create(options.limit)
  koaRouter
    .get('/state', function* getStateAll() {
      this.body = state.getState()
        .set('scenarios', state.getState().get('scenarios').map(scenario => {
          if (scenario.get('result').has('files')) {
            scenario = scenario.set('result', scenario.get('result').remove('files'))
          }
          return scenario
        }))
        .toJS()
    })
    .get('/state/:id', function* getState() {
      this.body = state.getState().toJS().scenarios.find((s) => s.__id === this.params.id)
    })
    .get('/options', function* getOptions() {
      this.body = options
    })
    .post('/scenario/:id', koaBody, function* postState() {
      let body = this.request.body
      if (typeof body !== 'object') {
        body = JSON.parse(body)
      }
      state.dispatch({
        type: 'POST_SCENARIO',
        scenario: body,
        id: this.params.id
      })
      this.body = state.getState().toJS()
    })
    .get('/scenario/:id', function* getScenario() {
      this.body = (yield readFile(path.join(__dirname, 'public/index.html'))).toString()
    })

  koaApp.use(function* errorHandler(next) {
    try {
      yield next
    } catch (e) {
      this.body = e.stack
      this.response.status = 500
    }
  })
  koaApp.use(require('koa-static')(path.join(__dirname, 'public')))
  koaApp.use(koaRouter.routes())
  return koaApp.listen(options.port)
}
