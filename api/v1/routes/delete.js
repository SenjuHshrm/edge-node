const Router = require('express').Router
const router = Router()
const passport = require('passport')
const { testCtrl, userCtrl, authCtrl } = require('../controllers')

router
  .delete('/test', testCtrl.delete)
  .delete('/logout', passport.authenticate('jwt', { session: false }), authCtrl.logout)


module.exports = router