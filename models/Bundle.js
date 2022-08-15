const mongoose = require("mongoose");
const { ObjectId } = mongoose.Schema;

let itemSchema = new mongoose.Schema({
  item: { type: ObjectId, required: true, ref: "inventory" },
  quantity: { type: String, required: true },
  price: { type: String, required: true },
});

let bundleSchema = new mongoose.Schema(
  {
    keyPartnerId: { type: ObjectId, required: true, ref: "user" },
    name: { type: String, required: true },
    items: [itemSchema],
    deletedAt: { type: String, default: "" },
  },
  {
    timestamps: true,
  }
);

let Bundle = mongoose.model("bundle", bundleSchema);

module.exports = Bundle;
