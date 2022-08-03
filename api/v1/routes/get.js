const Router = require('express').Router
const router = Router()
const passport = require('passport')
const { userCtrl, inqCtrl } = require('../controllers')

router
  .get('/profile/:id', passport.authenticate('jwt', { session: false }), userCtrl.profile)
  .get('/get-all-inquiries', passport.authenticate('jwt', { session: false }), inqCtrl.getAllInquiries)
  .get('/get-inquiries/:id', passport.authenticate('jwt', { session: false }), inqCtrl.getInquiriesByKeyPartner)

module.exports = router