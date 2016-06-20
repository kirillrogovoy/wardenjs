const co = require('co')
const os = require('os')
const crypto = require('crypto')
const mime = require('mime')
const fs = require('mz/fs')
const rimraf = require('rimraf')
const mkdirp = require('mkdirp')
const path = require('path')

module.exports = co.wrap(function* saveFiles(files, uniqueName) {
  const tmpDir = path.join(
    os.tmpdir(),
    'wardenjs_tmp',
    `${uniqueName}_${crypto.createHash('md5').update(uniqueName).digest('hex').substring(0, 6)}`
  )

  rimraf.sync(tmpDir)
  mkdirp.sync(tmpDir)
  for (let [i, file] of files.entries()) {
    // name includes left padding
    const filePathToSave = path
      .join(tmpDir, `${('00' + i).slice(-2)}_${file.name}.${mime.extension(file.media)}`)
    yield fs.writeFile(filePathToSave, file.content)
  }

  return tmpDir
})
