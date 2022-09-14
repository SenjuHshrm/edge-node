const Inventory  = require('../models/Inventory')
const NotificationCount = require('../models/NotificationCount')
const mongoose = require('mongoose')

mongoose.connect('mongodb://localhost:27017/edge-commerce')
mongoose.connection
  .on('open', async () => {
    try {
      await Inventory.updateMany({ $set: { criticalBalance: 0 } }).exec()
    } catch(e) {
      console.log(e)
    } finally {
      console.log('Patch done!!! Press Ctrl + C to close...')
    }
  })
  .on('error', (e) => {
    console.log(e)
    process.exit(1)
  })