const Router = require("express").Router;
const router = Router();
const passport = require("passport");
const {
  userCtrl,
  inqCtrl,
  classCtrl,
  custCtrl,
  invCtrl,
  bundleCtrl,
} = require("../controllers");

router
  .put(
    "/approve-inquiry/:inqId",
    passport.authenticate("jwt", { session: false }),
    inqCtrl.approveInquiry
  )
  .put(
    "/udpate-profile",
    passport.authenticate("jwt", { session: false }),
    userCtrl.updateProfile
  )
  .put(
    "/update-classification/:id",
    passport.authenticate("jwt", { session: false }),
    classCtrl.updateClassification
  )
  .put(
    "/update-customer/:id",
    passport.authenticate("jwt", { session: false }),
    custCtrl.updateCustomer
  )
  .put(
    "/update-inventory/:id",
    passport.authenticate("jwt", { session: false }),
    invCtrl.updateInventory
  )
  .put(
    "/update-many-status",
    passport.authenticate("jwt", { session: false }),
    invCtrl.updateManyNonMoving
  )
  .put(
    "/key-partner/approve/:id",
    passport.authenticate("jwt", { session: false }),
    userCtrl.approveAcctReq
  )
  .put(
    "/key-partner/status/set/:id",
    passport.authenticate("jwt", { session: false }),
    userCtrl.setActiveStatus
  )
  .put(
    "/key-partner/set-password/:id",
    passport.authenticate("jwt", { session: false }),
    userCtrl.setKeyPartnerPassword
  )
  .put(
    "/update-bundle/:id",
    passport.authenticate("jwt", { session: false }),
    bundleCtrl.updateBundle
  );

module.exports = router;
