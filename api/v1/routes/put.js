const Router = require('express').Router
const router = Router()
const passport = rqeuire('passport')
const { inqCtrl, testCtrl } = require('../controllers')

router
  .put('/approve-inquiry/:inqId', passport.authenticate('jwt', { session: false }), inqCtrl.approveInquiry)
  .put('/test', testCtrl.put)


module.exports = router