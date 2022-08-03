const mongoose = require('mongoose')
const { ObjectId } = mongoose.Schema

let itemSchema = new mongoose.Schema({
  item: String,
  price: String,
  markUp: String,
  totalPrice: String
})

let quotationSchema = new mongoose.Schema({
  quotationId: { type: ObjectId, required: true, ref: 'purchase-orders' },
  keyPartnerId: { type: String, required: true, ref: 'user' },
  items: [itemSchema],
  isApproved: { type: Boolean, required: true }
}, { timestamps: true })

let Quotation = mongoose.model('quotation', quotationSchema)

module.exports = Quotation