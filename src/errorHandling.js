import log from './log.js';
export function listener(err) {
  log.error(err);
  if (log.streams[1].stream) {
    log.streams[1].stream.on('close', function() {
      throw err;
    });
    log.streams[1].stream.end();
  } else {
    throw err;
  }
}

export function installErrorListener() {
  process.on('uncaughtException', listener);
}
