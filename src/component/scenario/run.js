const {check} = require('../../util.js')
const assert = require('assert')
const path = require('path')
const fs = require('mz/fs')
const mime = require('mime')
const co = require('co')

module.exports = function run(scenario, outStream = null) {
  return new Promise((resolve, reject) => {
    check.function(scenario.fn)
    if (outStream !== null) {
      check.equal(outStream.writable, true, 'Should be a writable stream!')
    } else {
      // Create a dummy writable steam
      outStream = require('stream').Writable()
      outStream._write = () => {}
    }
    let timeoutId
    const result = {
      finalMessage: null,
      warning: [],
      info: [],
      status: null,
      files: [],
      time: null
    }

    let executionStartTime

    const control = {
      warning(text) {
        return message(text, 'warning')
      },
      info(text) {
        return message(text, 'info')
      },
      step(stepIndex) {
        const description = scenario.description
        if (!description) {
          throw Error('Scenario has no description, so you can\'t call control.step()')
        }
        if (!description[stepIndex]) {
          throw Error(`Unknown step index: ${stepIndex}!`)
        }

        console.log(`Step "${stepIndex}": ${description[stepIndex]}.`.green)
      },
      /** input can be either a path or content **/
      file: co.wrap(function*(name, input, media) {
        if (result.status !== null) {
          throw Error('Error saving a file: scenario is already finished!')
        }
        let fileContent

        check.string(name)

        if (typeof input === 'string') {
          if (!path.isAbsolute(input)) {
            throw Error('path should be absolute!')
          }
          const fileExists = yield fs.exists(input)
          if (!fileExists) {
            throw Error(`File '${input}' doesn't exist!`)
          }

          fileContent = yield fs.readFile(input)
        } else if (Buffer.prototype.isPrototypeOf(input)) {
          fileContent = input
        } else {
          throw Error('input should be either string or buffer!')
        }

        check.string(media)
        const fileExtension = mime.extension(media)
        if (!fileExtension) {
          throw Error(`Unknown mime type: ${media}`)
        }

        result.files.push({
          name,
          media,
          content: fileContent
        })

        return true
      }),
      stream: outStream
    }

    function onErrorHandler(err) {
      clearTimeout(timeoutId)
      finish(
        'failure',
        'Scenario is broken! There was an unexpected error.\n' +
        `Stack: ${err.stack}\n`
      )
    }

    function onRejectionHandler(reason) {
      clearTimeout(timeoutId)
      finish(
        'failure',
        'Scenario is broken! There was an unhandled rejection.\n' +
        `Stack: ${reason.stack}\n`
      )
    }

    function message(text, type) {
      if (result.status !== null) {
        return false
      }
      check.string(text)
      result[type].push(text)
      return true
    }

    function finish(status, finalMessage) {
      if (result.status !== null) {
        return false
      }
      process.removeListener('uncaughtException', onErrorHandler)
      process.removeListener('unhandledRejection', onRejectionHandler)

      check.string(status)
      const statuses = new Set(['success', 'failure'])
      assert(
        statuses.has(status),
        `Status can be only one of these values: ${statuses}`
      )

      if (!finalMessage) {
        finalMessage = status === 'success' ? 'Passed.' : 'Failed.'
      } else if (typeof finalMessage !== 'string') {
        finalMessage = String(finalMessage)
      }

      clearTimeout(timeoutId)
      result.finalMessage = finalMessage
      result.status = status
      const timeDiff = process.hrtime(executionStartTime)
      result.time = (timeDiff[0] + timeDiff[1] / 1e9) // s
      resolve(result)
      return true
    }

    const timeoutSecs = parseInt(scenario.timeout, 10) || 30
    timeoutId = setTimeout(() => {
      reject(`TIMEOUT: ${timeoutSecs} seconds.`)
    }, timeoutSecs * 1000)

    process.prependOnceListener('uncaughtException', onErrorHandler)
    process.prependOnceListener('unhandledRejection', onRejectionHandler)
    executionStartTime = process.hrtime()
    const scenarioResult = scenario.fn(control)
    assert(
      scenarioResult &&
      scenarioResult.then !== undefined, 'Scenario should always return a Promise!'
    )
    scenarioResult
      .then((response) => {
        if (!Array.isArray(response) || response.length < 1) {
          throw Error(
            'Wrong scenario result! Should be [status, finalMessage (optional)] ' +
            `${typeof response} returned.`
          )
        }
        finish.apply(null, response)
      })
      .catch(onErrorHandler)
  })
}
