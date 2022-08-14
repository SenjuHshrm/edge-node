const mongoose = require('mongoose');

let capitalSchema = new mongoose.Schema({
  in: { type: String, required: true },
  out: { type: String, required: true },
  defective: { type: String, required: true },
  rts: { type: String, required: true },
  quantity: { type: String, required: true },
  price: String,
  totalAmt: String
})

let inventorySchema = new mongoose.Schema({
  desc: { type: String, required: true },
  classification: { type: String, required: true },
  code: { type: String, required: true },
  type: { type: String, required: true },
  color: { type: String, required: true },
  size: { type: String, required: true },
  sequence: { type: String, required: true },
  sku: { type: String, required: true }
})

const Inventory = mongoose.model('inventory', inventorySchema)

module.exports= Inventory
