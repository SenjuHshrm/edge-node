const { createReadStream, existsSync } = require('fs')
const readline = require('readline')

module.exports = {
  getLogsByDate: async (req, res) => {
    try {
      if(!existsSync(`./logs/EC-Logs-${req.params.date}.txt`)) return res.status(404).json({ msg: 'No logs found on the selected date' })
      let fileStream = createReadStream(`./logs/EC-Logs-${req.params.date}.txt`)
      let rl = readline.createInterface({
        input: fileStream,
        crlfDelay: Infinity
      })
      let c = 0
      let resp = []
      for await (let line of rl) {
        if(line !== '') {
          let obj = {}
          let props = ['date', 'controller', 'code', 'info']
          let arr = line.split(',')
          for(let a of arr) {
            obj[props[c]] = a.trim()
            c++
          }
          resp.push(obj)
          c = 0
        }
      }
      return res.status(200).json(resp)
    } catch(e) {
      return res.status(500).json({ code: 'LOG-0001', msg: e.toString() })
    }
  }
}