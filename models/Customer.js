const mongoose = require('mongoose')
const { ObjectId } = mongoose.Schema

let customerSchema = new mongoose.Schema({
  name: { type: String, required: true },
  addr: { type: String, required: true },
  contact: { type: String, required: true },
  email: { type: String, required: true },
  keyPartnerId: { type: ObjectId, required: true, ref: 'key-partners' }
})

let Customer = mongoose.model('customer', customerSchema)

module.exports = Customer