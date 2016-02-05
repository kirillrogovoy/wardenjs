import express from 'express';
import suspend from 'suspend';
import path from 'path';
import {root} from '../../../util.js';

export const setupServer = suspend.promise(function*(config, db) {
  const app = express();
  const viewPath = path.join(root, '../src/component/daemon/web-server/view');
  app.set('views', viewPath);
  app.set('view engine', 'hbs');

  app.get('/', (req, res) => {
    res.render('index');
  });

  app.get('/results.json', suspend.fn(function*(req, res) {
    const results = yield db.models.result.findAll({
      include: [{model: db.models.group}],
      order: [['created_at', 'DESC']]
    });
    res.json(results);
  }));

  yield app.listen(3000, suspend.resumeRaw());
  return true;
});
