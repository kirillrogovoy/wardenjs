import bunyan from 'bunyan';
import path from 'path';
import PrettyStream from 'bunyan-prettystream';

const prettyStdOut = new PrettyStream({ mode: 'dev' });
prettyStdOut.pipe(process.stdout);

export default bunyan.createLogger({
  name: 'APP',
  streams: [{
    level: 'trace',
    stream: prettyStdOut
  }, {
    level: 'info',
    path: path.join(__dirname, '../.log/general.log'),
    type: 'rotating-file',
    period: '1d',
    count: 3
  }]
});
