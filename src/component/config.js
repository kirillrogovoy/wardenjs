const fs = require('fs')
const path = require('path')
const suspend = require('suspend')
const assert = require('assert')
const {root, check} = require('../util.js')
const readdirRecursive = require('recursive-readdir-sync')

module.exports.getScenarioFiles = function getScenarioFiles(scenarioDirs) {
  check.array.of.string(scenarioDirs)
  let files = []
  for (let scenarioDir of scenarioDirs) {
    let fullPath = scenarioDir
    if (!path.isAbsolute(scenarioDir)) {
      fullPath = path.join(root, scenarioDir)
    }

    assert(fs.statSync(fullPath).isDirectory(), `${fullPath} is not a directory!`)
    files = files.concat(
      readdirRecursive(fullPath)
        .filter((item) => /^.*\.js$/.test(item))
        .map((item) => path.join(item))
    )
  }
  return files
}

module.exports.getGroups = function getGroups(groups, scenarioFiles) {
  if (!groups) {
    return {}
  }

  check.object(groups)
  for (let groupName of Object.keys(groups)) {
    const group = groups[groupName]
    check.array.of.string(group)
    groups[groupName] = group.map((filePattern) => {
      return scenarioFiles.find((file) => {
        return (new RegExp(filePattern).test(file))
      })
    })
  }

  return groups
}

module.exports.validate = function validate(config) {
  check.object(config)
  check.array.of.string(config.scenarioDirs, 'Malformed config.scenarioDirs')
  const scenarioFiles = module.exports.getScenarioFiles(config.scenarioDirs)
  module.exports.getGroups(config.groups, scenarioFiles)
}

module.exports.load = suspend.promise(function*(relativePath) {
  const fullPath = path.join(process.cwd(), relativePath)
  return JSON.parse(yield fs.readFile(fullPath, suspend.resume()))
})
