const mongoose = require('mongoose')
const { ObjectId } = mongoose.Schema

let contractSchema = new mongoose.Schema({
  keyPartner: { type: ObjectId, ref: 'user' },
  contract: String,
  file: String,
  isSeen: Boolean
}, { timestamps: true })

let Contract = mongoose.model('contract', contractSchema)

module.exports = Contract