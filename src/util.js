import path from 'path';
import suspend from 'suspend';
import fs from 'fs';
import nightmareLib from 'nightmare';
import tmp from 'tmp';
import checkTypes from 'check-types';
export const root = path.join(__dirname, '../lib');
export const check = checkTypes.assert;

export function nightmare(control) {
  check.object(control);
  const _nightmare = nightmareLib({
    width: 1600,
    height: 900
  });
  
  const screenshot = _nightmare.screenshot.bind(_nightmare);
  _nightmare.$screenshot = suspend.promise(function*(name) {
    const tmpName = yield tmp.tmpName({ template: '/tmp/nightmare-tmp-XXXXXX' }, suspend.resume());
    const media = 'image/png';
    const result = yield screenshot(tmpName, suspend.resume());
    console.log(result);
    yield control.file(name, tmpName, media);
    yield fs.unlink(tmpName, suspend.resume());
    return result;
  });
  return _nightmare;
}
