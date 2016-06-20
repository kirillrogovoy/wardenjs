module.exports = (result) => {
  let resultingText = ''
  const statusColor = result.status === 'success' ? 'green' : 'red'
  resultingText += `Status: ${result.status[statusColor]}.`

  const messageColor = {
    info: 'cyan',
    warning: 'yellow'
  }
  for (let type of ['info', 'warning']) {
    if (result[type].length) {
      resultingText += `\nThere was some ${type} messages:`
      for (let message of result[type]) {
        resultingText += `\n\t${message}`[messageColor[type]]
      }
    } else {
      resultingText += `\nThere weren\'t any ${type} messages`
    }
  }

  resultingText += `\nFinal message: ${result.finalMessage.yellow}`

  return resultingText
}
