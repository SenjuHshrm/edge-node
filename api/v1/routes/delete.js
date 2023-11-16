const Router = require("express").Router;
const router = Router();
const passport = require("passport");
const {
  userCtrl,
  authCtrl,
  classCtrl,
  custCtrl,
  invCtrl,
  bundleCtrl,
  bookingCtrl,
  contractCtrl,
  apiKeyCtrl,
} = require("../controllers");

router
  .delete(
    "/logout",
    passport.authenticate("jwt", { session: false }),
    authCtrl.logout
  )
  .delete(
    "/delete-classification/:id",
    passport.authenticate("jwt", { session: false }),
    classCtrl.deleteClassification
  )
  .delete(
    "/delete-customer/:id",
    passport.authenticate("jwt", { session: false }),
    custCtrl.deleteCustomer
  )
  .delete(
    "/delete-inventory/:id",
    passport.authenticate("jwt", { session: false }),
    invCtrl.deleteItem
  )
  .delete(
    "/delete-bundle/:id",
    passport.authenticate("jwt", { session: false }),
    bundleCtrl.deleteBundle
  )
  .delete(
    "/delete-kp/:id",
    passport.authenticate("jwt", { session: false }),
    userCtrl.deleteKeyPartners
  )
  .delete(
    '/acct-request/reject/:id/:email',
    passport.authenticate('jwt', { session: false }),
    userCtrl.rejectAcctReq
  )
  .delete(
    '/booking/remove/:id',
    passport.authenticate('jwt', { session: false }),
    bookingCtrl.deleteBooking
  )
  .delete(
    '/items/selected',
    passport.authenticate('jwt', { session: false }),
    invCtrl.deleteSelected
  )
  .delete(
    '/contract/:id',
    passport.authenticate('jwt', { session: false }),
    contractCtrl.deleteContract
  )
  .delete(
    '/api-key/remove/:id',
    passport.authenticate('jwt', { session: false }),
    apiKeyCtrl.deleteClient
  )

module.exports = router;
