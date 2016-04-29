const express = require('express')
const suspend = require('suspend')
const path = require('path')
const {root} = require('../../../util.js')

module.exports.setupServer = suspend.promise(function*(config, db) {
  const app = express()
  const viewPath = path.join(root, '../src/component/daemon/web-server/view')
  app.set('views', viewPath)
  app.set('view engine', 'hbs')

  app.get('/', (req, res) => {
    res.render('index')
  })

  app.get('/results.json', suspend.fn(function*(req, res) {
    const results = yield db.models.result.findAll({
      include: [{model: db.models.group}],
      order: [['created_at', 'DESC']]
    })
    res.json(results)
  }))

  yield app.listen(3000, suspend.resumeRaw())
  return true
})
