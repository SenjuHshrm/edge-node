const fs = require('fs')
const moment = require('moment')

let logFile = `./logs/EC-Logs-${moment(new Date()).format('MM-DD-YYYY')}.txt`


module.exports = (ctrl, fncName, code, err) => {
  try {
    if(!fs.existsSync(logFile)) {
      fs.writeFileSync(logFile, `Error logs - ${moment(new Date()).format('MM-DD-YYYY')}\n`)
    }
    let txt = `${moment(new Date()).format('MM-DD-YYYY hh:mm:ss A')}\nController: ${ctrl} -> ${fncName}\nCode: ${code}\nInfo: ${err.toString()}\n\n`;
    fs.appendFileSync(logFile, txt)
  } catch (e) {
    console.log(e)
  }
}