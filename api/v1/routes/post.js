const Router = require('express').Router
const router = Router()
const passport = require('passport')
const { userCtrl, authCtrl, inqCtrl, quoteCtrl, poCtrl } = require('../controllers')

router
  .post('/login', authCtrl.login)
  .post('/register', userCtrl.register)
  .post('/create-inquiry', passport.authenticate('jwt', { session: false }), inqCtrl.createInquiry)
  .post('/create-purchase-order', passport.authenticate('jwt', { session: false }), poCtrl.createPurchaseOrder)
  .post('/create-quotation', passport.authenticate('jwt', { session: false }), quoteCtrl.createQuotation)
  .post('/refresh/access', authCtrl.refreshToken)

module.exports = router