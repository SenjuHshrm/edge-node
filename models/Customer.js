const mongoose = require('mongoose')

let customerSchema = new mongoose.Schema({
  name: { type: String, required: true },
  addr: { type: String, required: true },
  contact: { type: String, required: true },
  email: { type: String, required: true }
})

let Customer = mongoose.model('customer', customerSchema)

module.exports = Customer