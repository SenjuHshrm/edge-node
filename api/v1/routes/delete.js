const Router = require('express').Router
const router = Router()
const passport = require('passport')
const { userCtrl, authCtrl } = require('../controllers')

router
  .delete('/logout', passport.authenticate('jwt', { session: false }), authCtrl.logout)


module.exports = router