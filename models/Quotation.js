const mongoose = require('mongoose')
const { ObjectId } = mongoose.Schema

let itemSchema = new mongoose.Schema({
  description: String,
  unitPrice: String,
  quantity: String,
  totalPrice: String
})

let quotationSchema = new mongoose.Schema({
  quotationId: { type: String, required: true },
  keyPartnerId: { type: ObjectId, required: true, ref: 'user' },
  quoteFrom: { type: String, required: true, ref: 'inquiry' },
  items: [itemSchema],
  status: { type: String, required: true },
  validUntil: { type: String, required: true }
}, { timestamps: true })

let Quotation = mongoose.model('quotation', quotationSchema)

module.exports = Quotation