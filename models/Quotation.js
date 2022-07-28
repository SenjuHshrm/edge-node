const mongoose = require('mongoose')

let itemSchema = new mongoose.Schema({
  item: String,
  price: String,
  markUp: String,
  totalPrice: String
})

let quotationSchema = new mongoose.Schema({
  quotationId: { type: String, required: true, ref: 'purchase-orders' },
  customerId: { type: String, required: true },
  items: [itemSchema]
}, { timestamps: true })

let Quotation = mongoose.model('quotation', quotationSchema)

module.exports = Quotation