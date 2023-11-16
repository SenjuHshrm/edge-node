const { Router } = require('express')
const checkAPIKey = require('./../middleware/check-api-key')
const BookingService = require('./service')

const openBookingRoute = Router()

openBookingRoute
  .put('/update-status/:bookingId', checkAPIKey, (req, res) => {
    return BookingService.updateBookingStatus(res, req.params.bookingId, req.body.status)
  })

module.exports = openBookingRoute