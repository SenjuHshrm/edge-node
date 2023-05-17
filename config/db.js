const mongoose = require('mongoose')
const User = require('../models/User')

module.exports = () => {
  mongoose.connect(process.env.MONGODB_URL, {
    authSource: 'admin',
    user: process.env.MONGODB_USER,
    pass: process.env.MONGODB_PASS
  })
  mongoose.connection
    .on('open', () => {
      console.log('Connected to edge-commerce Database')
      User.findOne({
        email: process.env.SU_EMAIL,
        username: process.env.SU_USERNAME
      }).then(user => {
        if(!user) {
          let usr = new User({
            email: process.env.SU_EMAIL,
            username: process.env.SU_USERNAME,
            name: process.env.SU_NAME,
            contact: '09100000000',
            company: 'Super Admin',
            accessLvl: 0,
            isActivated: true,
            isApproved: 'true'
          })
          usr.savePassword(process.env.SU_PASSWORD)
          usr.setImg('', process.env.SU_USERNAME)
          usr.save()

        }
      })
    })
    .on('error', (e) => {
      console.log(e)
    })
}