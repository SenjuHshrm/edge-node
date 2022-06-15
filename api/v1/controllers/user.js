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
      if(err) return res.status(500).json({ success: false, msg: info.message, data: err })
      if(!user) return res.status(401).json({ success: false, msg: info.message })
      let token = user.generateToken()
      user.refreshToken.push(token.refresh)
      user.markModified('refreshToken')
      user.save()
      return res.status(200).json({ success: true, msg: 'ok', info: token.access })
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
    user.savePassword(req.body.password)
    user.setImg(req.body.img, req.body.username)
    user.save().then(record => {
        return res.status(200).json({ msg: 'Account registered successfully' })
      })
      .catch(err => {
        return res.status(500).json({ msg: 'An error occured' })
      })
  },

  /**
   * Get user information by user id
   */
  profile: async (req, res) => {
    let user = await User.findById(req.params.id).exec()
    if(!user) {
      return res.status(404).json({ msg: 'User not found.' })
    }
    return res.status(200).json({ success: true, msg: 'success', data: user.userProfile(), info: res.locals.token })
  },

  /**
   * 
   * Request new access token
   * 
   */
  refreshToken: (req, res) => {
    
  }
  

}