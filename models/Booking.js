const mongoose = require("mongoose");
const { ObjectId } = mongoose.Schema;

let bookingSchema = new mongoose.Schema(
  {
    keyPartnerId: { type: ObjectId, required: true, ref: "user" },
    bookingId: { type: String, required: true },
    customer: { type: String, required: true },
    customerContact: { type: String, required: true },
    province: { type: String, required: true },
    city: { type: String, required: true },
    brgy: { type: String, required: true },
    hsStNum: { type: String, required: true },
    zip: { type: String, required: true },
    courier: { type: String, required: true },
    cod: { type: String, required: true },
    sender: { type: String, required: true },
    senderContact: { type: String, required: true },
    remarks: { type: String },
    status: { type: String, required: true },
    itemId: { type: String, required: true, ref: "inventory" },
    bundleId: { type: String, required: true, ref: "bundle" },
    quantity: { type: String },
    itemType: String,
  },
  {
    timestamps: true,
  }
);

let Booking = mongoose.model("booking", bookingSchema);

module.exports = Booking;
