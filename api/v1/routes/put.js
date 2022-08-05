const Router = require("express").Router;
const router = Router();
const passport = require("passport");
const { userCtrl, inqCtrl, classCtrl } = require("../controllers");

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
  );

module.exports = router;
