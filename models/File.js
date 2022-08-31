const mongoose = require('mongoose')

let fileSchema = new mongoose.Schema({
  filePath: String,
  from: {
    collection: String,
    id: String
  }
}, { timestamps: true })

const File = mongoose.model('file', fileSchema)

module.exports = File