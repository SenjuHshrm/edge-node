const Router = require("express").Router;
const router = Router();
const passport = require("passport");
const {
  userCtrl,
  inqCtrl,
  classCtrl,
  custCtrl,
  invCtrl,
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
  );

module.exports = router;
