const { Router } = require('express')
const checkAPIKey = require('./../middleware/check-api-key')
const BookingService = require('./service')

const openBookingRoute = Router()

openBookingRoute
  .put('/update-status/:waybill', checkAPIKey, (req, res) => {
    return BookingService.updateBookingStatus(res, req.params.waybill, req.body.status)
  })

module.exports = openBookingRoute