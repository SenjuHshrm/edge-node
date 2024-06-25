const writeLog = require('../../../utils/write-log')
const Booking = require('./../../../models/Booking')

let updateBookingStatus = async (res, data) => {
  try {
    let update = { $set: {} }
    // update.$set.deliveryStatus = deliveryStatus
    update.$set = {
      deliveryStatus: data.status
    }
    if(data.status === 'Delivered') {
      update.$set.status = 'fulfilled'
    } else {
      update.$set.status = 'unfulfilled'
    }
    await Booking.findOneAndUpdate({ ['jtWaybill.number']: data.waybill_number, bookingId: data.order_number }, update).exec()
    global.io.emit('booking:update-status', {
      waybill: data.waybill_number,
      status: data.status === 'Delivered' ? 'fulfilled' : 'unfullfiled',
      deliveryStatus: data.status
    })
    return res.status(200).json({ success: true })
  } catch(e) {
    // OPEN-BOOKING-0001
    writeLog('open-booking-service', 'updateBookingStatus', 'OPEN-BOOKING-0001', e.stack)
    return res.status(500).json({ success: false, code: 'OPEN-BOOKING-0001', msg: 'Failed to update status' })
  }
}

module.exports = {
  updateBookingStatus
}