const mongoose = require('mongoose')

module.exports = () => {
  mongoose.connect(process.env.MONGODB_URL)
  mongoose.connection
    .on('open', () => {
      console.log('Connected to edge-commerce Database')
    })
    .on('error', (e) => {
      console.log(e)
    })
}