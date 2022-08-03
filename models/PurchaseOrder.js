const mongoose = require('mongoose')
const { ObjectId } = mongoose.Schema

let itemSchema = new mongoose.Schema({
  item: String,
  price: String,
  markUp: String,
  totalPrice: String
})

let poSchema = new mongoose.Schema({
  poId: { type: String, required: true },
  buyer: { type: String, required: true },
  items: [itemSchema]
}, { timestamps: true })

let PurchaseOrder = mongoose.model('purchase-order', poSchema)

module.exports = PurchaseOrder