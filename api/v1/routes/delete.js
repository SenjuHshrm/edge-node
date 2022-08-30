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
  );

module.exports = router;
