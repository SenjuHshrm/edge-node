const mongoose = require("mongoose");
const { ObjectId } = mongoose.Schema;

let itemSchema = new mongoose.Schema({
  description: String,
  quantity: String,
  price: String,
  unitPrice: String,
  totalPrice: String,
});

let poSchema = new mongoose.Schema(
  {
    poId: { type: String, required: true },
    keyPartnerId: { type: ObjectId, ref: "user" },
    poFrom: { type: String, required: true },
    items: [itemSchema],
    seenBy: { type: [String] }
  },
  { timestamps: true }
);

let PurchaseOrder = mongoose.model("purchase-order", poSchema);

module.exports = PurchaseOrder;
