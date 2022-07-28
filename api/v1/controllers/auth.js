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
      if(err) return res.status(500).json({ success: false, msg: info.message, data: err })
      if(!user) return res.status(401).json({ success: false, msg: info.message })
      if(req.body.access !== user.accessLvl) return res.status(403).json({ success: false, msg: 'Your account does not have permission to access this dashboard' }) 
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
    try {
      let token = jwt.decode(req.headers.authorization.split(' ')[1])
      let user = await User.findById(token.sub)
      let refr = user.refreshToken.map(ref => ref.uid === token.uid)
      jwt.verify(refr.token, process.env.JWT_SECRET, { algorithms: ['HS256'] })
        .then(async (payload) => {
          let newToken = user.generateToken()
          await User.findByIdAndUpdate(payload.sub, { $pull: { uid: token.uid }, $push: { uid: newToken.uid, token: newToken.refresh } })
          return res.status(200).json({ success: true, token: newToken.access })
        })
        .catch(async (e) => {
          console.log(e)
          if(e.name === 'TokenExpiredError') {
            let newToken = user.generateToken()
            await User.findByIdAndUpdate(payload.sub, { $pull: { uid: token.uid }, $push: { uid: newToken.uid, token: newToken.refresh } })
            return res.status(200).json({ success: true, token: newToken.access })
          }
        })
    } catch(e) {
      console.log(e)
      return res.status(500).json({ success: false, msg: 'error' })
    }
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