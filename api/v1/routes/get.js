const Router = require('express').Router
const router = Router()
const { testCtrl } = require('../controllers')

router
  .get('/test', testCtrl.get)


module.exports = router