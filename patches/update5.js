const Contract = require('../models/Contract')
const mongoose = require('mongoose')

mongoose.connect('mongodb://localhost:27017/edge-commerce')
mongoose.connection
  .on('open', async () => {
    try {
      await Contract.updateMany({ $set: { isSeen: false } }).exec()
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