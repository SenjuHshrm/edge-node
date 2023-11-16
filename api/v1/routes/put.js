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
  excelCtrl,
  bookingCtrl,
  poCtrl,
  contractCtrl,
  authCtrl,
  apiKeyCtrl
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
    "/update-many-moving",
    passport.authenticate("jwt", { session: false }),
    invCtrl.updateManyMoving
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
    "/set-status/:id",
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
    "/change-password/internal-page",
    passport.authenticate("jwt", { session: false }),
    userCtrl.changeIPAPassword
  )
  .put(
    "/update-profile/:id",
    passport.authenticate("jwt", { session: false }),
    userCtrl.updateProfile
  )
  .put(
    "/update-username/:id",
    passport.authenticate("jwt", { session: false }),
    userCtrl.updateUsername
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
  .put(
    "/export/all",
    passport.authenticate("jwt", { session: false }),
    excelCtrl.generateExcelAllCourier
  )
  .put(
    "/mark-as-fulfilled",
    passport.authenticate("jwt", { session: false }),
    bookingCtrl.markSelectedAsFulfilled
  )
  .put(
    "/mark-one/fulfilled/:id",
    passport.authenticate("jwt", { session: false }),
    bookingCtrl.markOneAsFulfilled
  )
  .put(
    "/mark-one/unfulfilled/:id",
    passport.authenticate("jwt", { session: false }),
    bookingCtrl.markOneAsUnfulfilled
  )
  .put(
    "/export-one/:id",
    passport.authenticate("jwt", { session: false }),
    bookingCtrl.exportOne
  )
  .put(
    "/return/booking/:id",
    passport.authenticate("jwt", { session: false }),
    bookingCtrl.returnBooking
  )
  .put(
    "/inquiry/form/selected",
    passport.authenticate("jwt", { session: false }),
    inqCtrl.generateMultipleInquiry
  )
  .put(
    "/quotation/form/selected",
    passport.authenticate("jwt", { session: false }),
    quoteCtrl.generateMultipleQuoatation
  )
  .put(
    "/purchase-order/form/selected",
    passport.authenticate("jwt", { session: false }),
    poCtrl.generateMultiplePO
  )
  .put(
    "/purchase-order/set-seen/:id",
    passport.authenticate("jwt", { session: false }),
    poCtrl.setPOAsSeen
  )
  .put(
    "/contract/set-seen/:id",
    passport.authenticate("jwt", { session: false }),
    contractCtrl.markAsSeen
  )
  .put('/inventory/form/selected', passport.authenticate('jwt', { session: false }), invCtrl.exportSelected)
  .put("/reset-password/:id", authCtrl.resetPassword)
  .put('/api-key/generate/:id', passport.authenticate('jwt', { session: false }), apiKeyCtrl.generateApiKey)

module.exports = router;
