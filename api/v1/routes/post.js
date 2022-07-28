const Router = require('express').Router
const router = Router()
const passport = require('passport')
const { testCtrl, userCtrl, authCtrl, inqCtrl } = require('../controllers')

router
  .post('/login', authCtrl.login)
  .post('/test', testCtrl.post)
  .post('/register', userCtrl.register)
  .post('/create-inquiry', passport.authenticate('jwt', { session: false }), inqCtrl.createInquiry)
  .post('/refresh/access', authCtrl.refreshToken)

module.exports = router