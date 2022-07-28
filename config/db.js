const mongoose = require('mongoose')
const User = require('../models/User')

module.exports = () => {
  mongoose.connect(process.env.MONGODB_URL)
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
            firstName: 'Super',
            middleName: '',
            lastName: 'Admin',
            extName: '',
            gender: 'male',
            birthday: '1990/01/01',
            contact: '09100000000',
            addr: {
              province: 'Province',
              city: 'City',
              brgy: 'Barangay',
              st: 'Street/HouseNumber'
            },
            accessLvl: 0
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