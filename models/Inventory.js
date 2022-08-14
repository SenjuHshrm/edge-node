const mongoose = require("mongoose");
const { ObjectId } = mongoose.Schema;

let capitalSchema = new mongoose.Schema({
  in: { type: String },
  out: { type: String },
  defective: { type: String },
  rts: { type: String },
  quantity: { type: String },
  price: { type: String },
  totalAmt: { type: String },
});


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

const Inventory = mongoose.model("inventory", inventorySchema);

module.exports = Inventory;
