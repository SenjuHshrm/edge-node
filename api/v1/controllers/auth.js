const jwt = require('jsonwebtoken')
const passport = require('passport')
const User = require('../../../models/User')

module.exports = {
  /**
   * 
   * Authenticates the user using PassportJS
   *
   */
   login: (req, res) => {
    passport.authenticate('local', (err, user, info) => {
      if(err) return res.status(500).json({ success: false, msg: info, data: err })
      if(!user) return res.status(401).json({ success: false, msg: info.message })
      if(!user.isActivated) return res.status(403).json({ success: false, msg: 'Your account is deactivated' })
      if(req.body.access.indexOf(user.accessLvl) === -1) return res.status(403).json({ success: false, msg: 'Your account does not have permission to access this dashboard' }) 
      let token = user.generateToken()
      user.refreshToken.push({ uid: token.uid, token: token.refresh })
      user.markModified('refreshToken')
      user.save()
      return res.status(200).json({ success: true, msg: 'ok', info: token.access })
    })(req, res)
  },

  /**
   * 
   * Request new access token
   * 
   */
  refreshToken: async (req, res) => {
    let token = jwt.decode(req.headers.authorization.split(' ')[1])
    let user = await User.findById(token.sub).exec()
    let refr = user.refreshToken.filter(ref => { return ref.uid === token.uid })
    try {
      let decode = jwt.verify(refr[0].token, process.env.JWT_SECRET)
      let newToken = user.generateToken()
      await User.findOneAndUpdate({ _id: decode.sub, ['refreshToken.uid']: refr[0].uid }, { $set: { 'refreshToken.$': { uid: newToken.uid, token: newToken.refresh } } }).exec()
      return res.status(200).json({ success: true, token: newToken.access })
    } catch(e) {
      console.log(e)
      if(e.name === 'TokenExpiredError') {
        let newToken = user.generateToken()
        await User.findOneAndUpdate({ _id: token.sub, ['refreshToken.uid']: refr[0].uid }, { $set: { 'refreshToken.$': { uid: newToken.uid, token: newToken.refresh } } }).exec()
        return res.status(200).json({ success: true, token: newToken.access })
      }
    }
  },

  /**
   * Internal page authentication
   */
  internalPageAuth: (req, res) => {
    User.findById(req.body.id)
      .then(user => {
        if(!user.compareSecondPassword(req.body.secPass)) return res.status(401).json({ success: false, msg: 'Incorrect password' })
        return res.status(200).json({ success: true })
      })
      .catch(e => {
        console.log(e)
        return res.status(500).json({ success: false, msg: '' })
      })
  },


  /**
   * 
   * Logout
   * 
   */
  logout: async (req, res) => {
    try {
      let token = jwt.decode(req.headers.authorization.split(' ')[1])
      await User.findByIdAndUpdate(token.sub, { $pull: { refreshToken: { uid: token.uid } } })
      return res.status(200).json({ success: true, msg: 'logout' })
    } catch(e) {
      console.log(e)
      return res.status(500).json({ success: false, msg: 'error' })
    }
  }
}