const Router = require("express").Router;
const router = Router();
const passport = require("passport");
const { userCtrl, inqCtrl, classCtrl, authCtrl } = require("../controllers");

router
  .get(
    "/profile/:id",
    passport.authenticate("jwt", { session: false }),
    userCtrl.profile
  )
  .get(
    "/get-all-inquiries",
    passport.authenticate("jwt", { session: false }),
    inqCtrl.getAllInquiries
  )
  .get(
    "/inquiries/:id",
    passport.authenticate("jwt", { session: false }),
    inqCtrl.getInquiriesByKeyPartner
  )
  .get(
    "/get-all-classification",
    passport.authenticate("jwt", { session: false }),
    classCtrl.getAllClassification
  )
  .get(
    "/get-classification/:id",
    passport.authenticate("jwt", { session: false }),
    classCtrl.getClassification
  )
  .get(
    "/get-all-classification/:type",
    passport.authenticate("jwt", { session: false }),
    classCtrl.getClassificationByType
  )
  .get(
    "/refresh/access",
    authCtrl.refreshToken
  )
module.exports = router;
