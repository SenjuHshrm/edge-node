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
  bundleCtrl,
  contractCtrl,
  quoteCtrl,
  poCtrl,
  addrCtrl,
  bookingCtrl,
} = require("../controllers");

router
  .get(
    "/profile/:id",
    passport.authenticate("jwt", { session: false }),
    userCtrl.profile
  )
  .get(
    "/key-partners/for-approval",
    passport.authenticate("jwt", { session: false }),
    userCtrl.getAccountsForApproval
  )
  .get(
    "/key-partners/approved",
    passport.authenticate("jwt", { session: false }),
    userCtrl.getApprovedKeyPartners
  )
  .get(
    "/key-partners/activated",
    passport.authenticate("jwt", { session: false }),
    userCtrl.getActiveKeyPartners
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
    passport.authenticate("jwt", { session: false }),
    invCtrl.getAllItems
  )

  .get(
    "/get-all-inventory-byKey/:id",
    passport.authenticate("jwt", { session: false }),
    invCtrl.getAllByKeyPartners
  )

  .get(
    "/get-all-bundles-byKey/:id",
    passport.authenticate("jwt", { session: false }),
    bundleCtrl.getAllBundledPerKeyPartners
  )
  .get(
    "/get-all-bundle/:id",
    passport.authenticate("jwt", { session: false }),
    bundleCtrl.getOneBundle
  )
  .get(
    "/get-keypartner/:id",
    passport.authenticate("jwt", { session: false }),
    userCtrl.getOneKeyPartners
  )
  .get(
    "/key-partners/contract/:type",
    passport.authenticate("jwt", { session: false }),
    contractCtrl.getContractSendingHistory
  )
  .get(
    "/quotations/all",
    passport.authenticate("jwt", { session: false }),
    quoteCtrl.getAllQuotations
  )
  .get(
    "/quotations/:id",
    passport.authenticate("jwt", { session: false }),
    quoteCtrl.getOuotationsByKeyPartner
  )
  .get(
    "/purchase-order/all",
    passport.authenticate("jwt", { session: false }),
    poCtrl.getAllPurchaseOrder
  )
  .get(
    "/contract/:type/:id",
    passport.authenticate("jwt", { session: false }),
    contractCtrl.getContractByKeyPartner
  )
  .get(
    "/check-address/:province/:city/:brgy/:type",
    passport.authenticate("jwt", { session: false }),
    addrCtrl.checkAddressToCourier
  )
  .get(
    "/get-all/booking/:id",
    passport.authenticate("jwt", { session: false }),
    bookingCtrl.getAllBookingPerKP
  )
  .get(
    "/get-all/booking",
    passport.authenticate("jwt", { session: false }),
    bookingCtrl.getAllBookings
  )
  .get(
    '/monthly-booking/:start/:end',
    passport.authenticate("jwt", { session: false }),
    bookingCtrl.getMonthlyBooking
  )
  .get(
    '/monthly-booking/:start/:end/:id',
    passport.authenticate("jwt", { session: false }),
    bookingCtrl.getMonthlyBookingByKeyPartner
  )

  .get("/refresh/access", authCtrl.refreshToken);

module.exports = router;
