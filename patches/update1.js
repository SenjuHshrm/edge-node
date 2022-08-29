const User  = require('../models/User')
const NotificationCount = require('../models/NotificationCount')
const mongoose = require('mongoose')

mongoose.connect('mongodb://localhost:27017/edge-commerce')
mongoose.connection
  .on('open', async () => {
    try {
      let users = await User.find({}).exec()
      users.forEach(async user => {
        if(user.accessLvl === 1 || user.accessLvl === 2) {
          await new NotificationCount({
            userId: user._doc._id,
            purchaseOrder: { count: 0, isOpened: true },
            acctReq: { count: 0, isOpened: true }
          }).save()
        } else if(user.accessLvl === 3) {
          await new NotificationCount({
            userId: user._doc._id,
            contract: { count: 0, isOpened: true },
            quotation: { count: 0, isOpened: true }
          }).save()
        }
      })
      console.log('Patch done!!! Press Ctrl + C to close...')
    } catch(e) {
      console.log(e)
    }
  })
  .on('error', (e) => {
    console.log(e)
    process.exit(1)
  })


