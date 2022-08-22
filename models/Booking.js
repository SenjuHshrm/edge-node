const mongoose = require('mongoose')
const { ObjectId } = mongoose.Schema

let itemSchema = new mongoose.Schema({
  itemId: { type: ObjectId, ref: 'inventory' },
  quantity: String,
  itemType: String
})

let bookingSchema = new mongoose.Schema({
  keyPartnerId: { type: ObjectId, requried: true, ref: 'user' },
  customer: { type: String, required: true },
  customerContact: { type: String, required: true },
  province: { type: String, required: true },
  city: { type: String, required: true },
  brgy: { type: String, required: true },
  hsStNum: { type: String, required: true },
  zip: { type: String, required: true },
  courier: { type: String, required: true },
  product: { type: String, required: true },
  quantity: { type: String, required: true },
  cod: { type: String, required: true },
  sender: { type: String, required: true },
  senderContact: { type: String, required: true },
  remarks: { type: String, required: true },
  items: [itemSchema],
  status: { type: String, required: true }
})

let Booking = mongoose.model('booking', bookingSchema)

module.exports = Booking