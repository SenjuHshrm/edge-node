const mongoose = require('mongoose')
const { ObjectId } = mongoose.Schema

let itemSchema = new mongoose.Schema({
  itemName: String,
  quantity: Number,
  units: String,
  remarks: String
})

let inqSchema = new mongoose.Schema({
  inqId: { type: String, required: true },
  keyPartnerId: { type: ObjectId, required: true, ref: 'user' },
  items: [itemSchema],
  isApproved: { type: Boolean, required: false }
}, { timestamps: true })

let Inquiry = mongoose.model('inquiry', inqSchema)

module.exports = Inquiry