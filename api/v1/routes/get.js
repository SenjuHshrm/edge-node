const Router = require('express').Router
const router = Router()
const passport = require('passport')
const { testCtrl, userCtrl } = require('../controllers')

router
  .get('/profile/:id', passport.authenticate('jwt', { session: false }), userCtrl.profile)
  .get('/test', testCtrl.get)


module.exports = router