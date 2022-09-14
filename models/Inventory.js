const mongoose = require("mongoose");
const { ObjectId } = mongoose.Schema;

let inventorySchema = new mongoose.Schema(
  {
    keyPartnerId: { type: ObjectId, required: true, ref: "user" },
    desc: { type: String, required: true },
    classification: { type: ObjectId, required: true, ref: "classification" },
    code: { type: ObjectId, required: true, ref: "classification" },
    color: { type: ObjectId, required: true, ref: "classification" },
    size: { type: ObjectId, required: true, ref: "classification" },
    sequence: { type: String, required: true },
    in: { type: String, required: true },
    out: { type: String, default: "0" },
    defective: { type: String, default: "0" },
    rts: { type: String, default: "0" },
    currentQty: { type: String, required: true },
    price: { type: String, required: true },
    criticalBalance: { type: String, required: true },
    status: { type: String, default: "moving" },
    deletedAt: { type: String, default: "" },
  },
  {
    timestamps: true,
  }
);

const Inventory = mongoose.model("inventory", inventorySchema);

module.exports = Inventory;
