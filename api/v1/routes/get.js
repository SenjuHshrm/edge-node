const Router = require("express").Router;
const router = Router();
const passport = require("passport");
const {
  userCtrl,
  inqCtrl,
  classCtrl,
  authCtrl,
  custCtrl,
  invCtrl,
} = require("../controllers");

router
  .get(
    "/profile/:id",
    passport.authenticate("jwt", { session: false }),
    userCtrl.profile
  )
  .get(
    '/key-partners/for-approval',
    passport.authenticate('jwt', { session: false }),
    userCtrl.getAccountsForApproval
  )
  .get(
    '/key-partners/approved',
    passport.authenticate('jwt', { session: false }),
    userCtrl.getApprovedKeyPartners
  )
  .get(
    "/inquiries/all",
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
    "/get-all-customer/:id",
    passport.authenticate("jwt", { session: false }),
    custCtrl.getAllCustomer
  )
  .get(
    "/get-customer/:id",
    passport.authenticate("jwt", { session: false }),
    custCtrl.getCustomer
  )

  .get(
    "/get-key-partners",
    passport.authenticate("jwt", { session: false }),
    userCtrl.getKeyPartners
  )

  .get(
    "/get-all-inventory",
    // passport.authenticate("jwt", { session: false }),
    invCtrl.getAllItems
  )

  .get("/refresh/access", authCtrl.refreshToken);

module.exports = router;
