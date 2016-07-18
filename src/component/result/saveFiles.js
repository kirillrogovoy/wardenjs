const co = require('co')
const os = require('os')
const mime = require('mime')
const fs = require('mz/fs')
const rimraf = require('rimraf')
const mkdirp = require('mkdirp')
const path = require('path')

module.exports = co.wrap(function* saveFiles(files, uniqueName, dir = null) {
  if (!dir) {
    dir = path.join(os.tmpdir(), 'wardenjs_tmp')
  }

  dir = path.join(dir, uniqueName)

  rimraf.sync(dir)
  mkdirp.sync(dir)
  for (let [i, file] of files.entries()) {
    // name includes left padding
    const filePathToSave = path
      .join(dir, `${('00' + i).slice(-2)}_${file.name}.${mime.extension(file.media)}`)
    yield fs.writeFile(filePathToSave, file.content)
  }

  return dir
})
