const { Router } = require('express')
const checkAPIKey = require('./../middleware/check-api-key')
const BookingService = require('./service')

const jntStatus = {
  "Pickup": "Picked up",
  "Pickup Failed": "Pickup failed",
  "Departure": "Departed",
  "Arrival": "Arriving",
  "Delivering": "Delivering",
  "P.O.D. (Delivered)": "Delivered",
  "Delivery Failed": "Delivery Failed",
  "Return (Return registration)": "Returning to sender",
  "R.P.O.D (Returned)": "Returned"
}

const openBookingRoute = Router()

/**
 * 
 * Request Body 
 * {
 *  "status": "jntStatus{}",
    "order_number": "bookingId",
    "waybill_number": "jtWaybill.number"
 * }
 * 
 */

openBookingRoute
  .put('/update-status', checkAPIKey, (req, res) => {
    let body = {
      ...req.body,
      status: jntStatus[req.body.status]
    }
    return BookingService.updateBookingStatus(res, body)
  })

module.exports = openBookingRoute