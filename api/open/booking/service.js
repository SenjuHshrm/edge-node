const writeLog = require('../../../utils/write-log')
const Booking = require('./../../../models/Booking')

let updateBookingStatus = async (res, waybill, deliveryStatus) => {
  try {
    let update = { $set: {} }
    update.$set.deliveryStatus = deliveryStatus
    if(deliveryStatus === 'delivered') {
      update.$set.status = 'fulfilled'
    }
    await Booking.findOneAndUpdate({ ['jtWaybill.number']: waybill }, update).exec()
    if(deliveryStatus === 'delivered') global.io.emit('booking:update-status', { waybill, status: 'fulfilled', deliveryStatus: 'delivered' })
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