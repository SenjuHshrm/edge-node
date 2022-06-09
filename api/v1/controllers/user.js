const User = require('../models/User')
const passport = require('passport')

module.exports = {

  /**
   * 
   * Authenticates the user using PassportJS
   *
   */
  login: (req, res) => {
    passport.authenticate('local', (err, user, info) => {

    })(req, res)
  },

  /**
   * 
   * User registration
   * 
   */
  register: (req, res) => {
    let user = new User({
      email: req.body.email,
      username: req.body.username,
      firstName: req.body.fName,
      middleName: req.body.mName,
      lastName: req.body.lName,
      extName: req.body.xName,
      gender: req.body.gender,
      birthday: req.body.bday,
      contact: req.body.contact,
      addr: req.body.addr
    })
    user
      .savePassword(req.body.password)
      .setImg(req.body.img, req.body.username)
      .save().then(record => {
        return res.status(200).json({ msg: 'Account registered successfully' })
      })
      .catch(err => {
        return res.status(500).json({ msg: 'An error occured' })
      })
  }
  

}