const express = require('express')
const co = require('co')
const path = require('path')
const {root} = require('../../../util.js')

module.exports.setupServer = co.wrap(function*(config, db) {
  const app = express()
  const viewPath = path.join(root, '../src/component/daemon/web-server/view')
  app.set('views', viewPath)
  app.set('view engine', 'hbs')

  app.get('/', (req, res) => {
    res.render('index')
  })

  app.get('/results.json', function(req, res) {
    db.models.result.findAll({
      include: [{model: db.models.group}],
      order: [['created_at', 'DESC']]
    }).then(res.json)
  })

  yield app.listen(3000, co.resumeRaw())
  return true
})
