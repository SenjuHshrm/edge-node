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
  keyPartnerId: { type: ObjectId, required: true, ref: "user" },
  desc: { type: String, required: true },
  code: { type: ObjectId, required: true, ref: "classification" },
  classification: { type: ObjectId, required: true, ref: "classification" },
  color: { type: ObjectId, required: true, ref: "classification" },
  size: { type: ObjectId, required: true, ref: "classification" },
  sequence: { type: String, required: true },
  deletedAt: { type: String, default: "" },
  movingInv: capitalSchema,
  nonMovingInv: capitalSchema,
}, { timestamps: true })

const Inventory = mongoose.model("inventory", inventorySchema);

module.exports = Inventory;
