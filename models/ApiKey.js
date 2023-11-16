const mongoose = require('mongoose')

let ApiKeySchema = new mongoose.Schema({
  client: { type: String, unique: true, required: true },
  key: String
}, {
  timestamps: true
})

let ApiKey = mongoose.model('api-key', ApiKeySchema)

module.exports = ApiKey