const fs = require('fs')
const moment = require('moment')

let logFile = `./logs/JT-Log-${moment(new Date()).format('MM-DD-YYYY')}.txt`

module.exports = (res, esc) => {
  try {
    if(!fs.existsSync(logFile)) fs.writeFileSync(logFile, `J&T Waybill Generation Logs - ${moment(new Date()).format('MM-DD-YYYY')}`)
    let txt = `${moment(new Date()).format('MM-DD-YYYY hh:mm:ss A')}, ${JSON.stringify(res)}${esc}`
    fs.appendFileSync(logFile, txt)
  } catch(e) {
    console.log(e)
  }
}