const Router = require('express').Router
const router = Router()
const { testCtrl, userCtrl } = require('../controllers')

router
  .post('/login', userCtrl.login)
  .post('/test', testCtrl.post)
  .post('/refresh/access', userCtrl.refreshToken)

module.exports = router