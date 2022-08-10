const mongoose = require("mongoose");
const { ObjectId } = mongoose.Schema;

let customerSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    addr: {
      province: { type: String, required: true },
      city: { type: String, required: true },
      brgy: { type: String, required: true },
      hsStNum: { type: String, required: true },
    },
    contact: { type: String, required: true },
    email: { type: String, required: true },
    keyPartnerId: { type: ObjectId, required: true, ref: "key-partners" },
    deletedAt: { type: String, default: "" },
  },
  {
    timestamps: true,
  }
);

let Customer = mongoose.model("customer", customerSchema);

module.exports = Customer;
