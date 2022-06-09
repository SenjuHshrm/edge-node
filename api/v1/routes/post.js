const Router = require('express').Router
const router = Router()
const { testCtrl, userCtrl } = require('../controllers')

router
  .post('/test', testCtrl.post)
  .post('/login', userCtrl.login)


module.exports = router