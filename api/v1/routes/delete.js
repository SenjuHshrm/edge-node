const Router = require('express').Router
const router = Router()
const { testCtrl } = require('../controllers')

router
  .delete('/test', testCtrl.delete)


module.exports = router