const Router = require('express').Router
const router = Router()
const { testCtrl } = require('../controllers')

router
  .put('/test', testCtrl.put)


module.exports = router