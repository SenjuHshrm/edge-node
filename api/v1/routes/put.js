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
  quoteCtrl,
} = require("../controllers");
const path = require("path");
const multer = require("multer");
const tempStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(global.appRoot, "/uploads/files"));
  },
  filename: (req, file, cb) => {
    let filename = req.body.name;
    cb(null, `${filename}.csv`);
  },
});
const uploadTemp = multer({
  dest: "/uploads/files",
  storage: tempStorage,
  limits: { fileSize: 1024000000 },
});

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
  )
  .put(
    "/key-partner/set-user-id/:id",
    passport.authenticate("jwt", { session: false }),
    userCtrl.setKeyPartnerCode
  )
  .put(
    "/set-pending/:id",
    passport.authenticate("jwt", { session: false }),
    quoteCtrl.markAsPending
  )
  .put(
    "/addr-temp",
    passport.authenticate("jwt", { session: false }),
    uploadTemp.single("file"),
    (req, res) => {
      // console.log(req.file)
      return res.sendStatus(204);
    }
  )
  .put(
    "/change-password",
    passport.authenticate("jwt", { session: false }),
    userCtrl.changePassword
  )
  .put(
    "/update-profile/:id",
    passport.authenticate("jwt", { session: false }),
    userCtrl.updateProfile
  )
  .put(
    "/assign-codePassword/:id",
    passport.authenticate("jwt", { session: false }),
    userCtrl.assignCodeAndPassword
  )
  .put(
    "/toggle-notification/:id",
    passport.authenticate("jwt", { session: false }),
    userCtrl.updateNotifOpenStatus
  )
module.exports = router;
