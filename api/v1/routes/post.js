const Router = require("express").Router;
const router = Router();
const passport = require("passport");
const {
  userCtrl,
  authCtrl,
  inqCtrl,
  quoteCtrl,
  poCtrl,
  classCtrl,
  custCtrl,
  invCtrl,
  bundleCtrl,
  contractCtrl,
  bookingCtrl,
} = require("../controllers");
const path = require("path");
const multer = require("multer");

const contStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(global.appRoot, "/uploads/contract"));
  },
  filename: (req, file, cb) => {
    cb(null, req.body.filename);
  },
});
const uploadCont = multer({ dest: "/uploads/contract", storage: contStorage });

const bookingStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(global.appRoot, "/uploads/booking"));
  },
  filename: (req, file, cb) => {
    cb(null, req.body.filename);
  },
})
const uploadBooking = multer({ dest: '/uploads/booking', storage: bookingStorage })

const dpStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(global.appRoot, "/uploads/profile"));
  },
  filename: (req, file, cb) => {
    cb(null, req.body.filename);
  },
});
const dpUpload = multer({ dest: "/uploads/profile", storage: dpStorage });

router
  .post("/login", authCtrl.login)
  .post('/authenticate/internal-page', passport.authenticate('jwt', { session: false }), authCtrl.internalPageAuth)
  .post("/register", userCtrl.register)
  .post(
    "/create-inquiry",
    passport.authenticate("jwt", { session: false }),
    inqCtrl.createInquiry
  )
  .post(
    "/create-purchase-order",
    passport.authenticate("jwt", { session: false }),
    poCtrl.createPurchaseOrder
  )
  .post(
    "/create-quotation",
    passport.authenticate("jwt", { session: false }),
    quoteCtrl.createQuotation
  )
  .post(
    "/create-classification",
    passport.authenticate("jwt", { session: false }),
    classCtrl.createClassification
  )
  .post(
    "/create-customer",
    passport.authenticate("jwt", { session: false }),
    custCtrl.createCustomer
  )
  .post(
    "/create-inventory",
    passport.authenticate("jwt", { session: false }),
    invCtrl.createInventory
  )
  .post(
    "/create-bundle",
    passport.authenticate("jwt", { session: false }),
    bundleCtrl.createBundle
  )
  .post(
    "/key-partners/save-contract",
    passport.authenticate("jwt", { session: false }),
    uploadCont.single("file"),
    contractCtrl.saveContract
  )
  .post(
    "/booking/add",
    passport.authenticate("jwt", { session: false }),
    bookingCtrl.createBooking
  )
  .post(
    "/profile/upload",
    passport.authenticate("jwt", { session: false }),
    dpUpload.single("image"),
    userCtrl.updateProfileImage
  )
  .post(
    '/booking/upload-custom',
    passport.authenticate('jwt', { session: false }),
    uploadBooking.single('file'),
    bookingCtrl.uploadBooking
  )

module.exports = router;
