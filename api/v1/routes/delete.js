const Router = require("express").Router;
const router = Router();
const passport = require("passport");
const { userCtrl, authCtrl, classCtrl } = require("../controllers");

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
  );

module.exports = router;
