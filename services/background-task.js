const schedule = require('node-schedule')
const File = require('../models/File')
const Contract = require('../models/Contract')
const moment = require('moment')
const fs = require('fs')

module.exports = {
  /**
   * Detect files to be deleted 
   * cron(seconds(0-59), minutes(0-59), hours(0-23), days(1-31), month(1-12), dayOfWeek(0-7, 0/7=Sun))
   */
  clearFiles: () => {
    schedule.scheduleJob('0 0 0 * * *', async () => {
      let files = await File.find({}).exec()
      files.forEach(async file => {
        if(moment().diff(moment(file.createdAt), 'weeks') === 2) {
          if(file.from.collection !== 'contract') {
            fs.unlinkSync(file.filePath)
            await File.findByIdAndDelete(file.from.id).exec()
          }
        }
      })
    })
  },


}
