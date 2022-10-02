const Booking = require('../models/Booking')
const Bundle = require('../models/Bundle')
const mongoose = require('mongoose')

mongoose.connect('mongodb://localhost:27017/edge-commerce')
mongoose.connection
  .on('open', async () => {
    try {
      await Booking.updateMany({ $set: { deletedAt: '' } }).exec()
      let bookings = await Booking.find({ itemType: 'bundle' }).exec()
      bookings.map(async booking => {
        let bnd = await Bundle.findById(booking.bundleId).exec()
        if(bnd !== null) {
          booking.bundleId = {
            name: bnd.name,
            quantity: '',
            items: bnd.items
          }
          booking.markModified('bundleId')
          booking.save()
        } else {
          booking.bundleId = {
            name: '',
            quantity: '',
            items: []
          }
          booking.markModified('bundleId')
          booking.save()
        }
      })
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