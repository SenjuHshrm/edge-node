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
  excelCtrl
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
    "/get-all-inventory/:page/:limit",
    passport.authenticate("jwt", { session: false }),
    invCtrl.getAllItems
  )

  .get(
    "/get-all-inventory-filtered/:page/:limit",
    passport.authenticate('jwt', { session: false }),
    invCtrl.getAllItemsFiltered
  )

  .get(
    "/get-all-inventory-byKey/:id",
    passport.authenticate("jwt", { session: false }),
    invCtrl.getAllByKeyPartners
  )
  .get(
    "/get-all-inventory-byKey-filtered/:id/:page/:limit",
    passport.authenticate("jwt", { session: false }),
    invCtrl.getAllByKeyPartnersFiltered
  )

  .get(
    "/get-all-inventory-byKey/:id/:page/:limit",
    passport.authenticate('jwt', { session: false }),
    invCtrl.getallByKeyPartnersPerPage
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
    '/quotations/declined',
    passport.authenticate("jwt", { session: false }),
    quoteCtrl.getForRequote
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
    "/check-address/:type",
    passport.authenticate("jwt", { session: false }),
    addrCtrl.checkAddressToCourier
  )
  .get(
    "/get-all/booking/:id",
    passport.authenticate("jwt", { session: false }),
    bookingCtrl.getAllBookingPerKP
  )
  .get(
    "/get-all/booking/:id/:page/:limit",
    passport.authenticate("jwt", { session: false }),
    bookingCtrl.getAllBookingPerKPPerPage
  )
  .get(
    "/get-all/booking",
    passport.authenticate("jwt", { session: false }),
    bookingCtrl.getAllBookings
  )
  .get(
    "/get-all/booking/:page/:limit",
    passport.authenticate("jwt", { session: false }),
    bookingCtrl.getAllBookingsByPage
  )
  .get(
    "/monthly-booking/:start/:end",
    passport.authenticate("jwt", { session: false }),
    bookingCtrl.getMonthlyBooking
  )
  .get(
    '/get-all/booking-filtered/:page/:limit',
    passport.authenticate('jwt', { session: false }),
    bookingCtrl.getAllBookingFiltered
  )
  .get(
    '/get-all/booking-filtered/:id/:page/:limit',
    passport.authenticate('jwt', { session: false }),
    bookingCtrl.getAllBookingPerKPFiltered
  )
  .get(
    "/monthly-booking/:start/:end/:id",
    passport.authenticate("jwt", { session: false }),
    bookingCtrl.getMonthlyBookingByKeyPartner
  )
  .get(
    "/notif-count/:id",
    passport.authenticate("jwt", { session: false }),
    userCtrl.getNotificationCounts
  )
  .get(
    "/inquiry/form/:id",
    passport.authenticate("jwt", { session: false }),
    inqCtrl.generateSingleInquiryForm
  )
  .get(
    "/quotation/form/:id",
    passport.authenticate("jwt", { session: false }),
    quoteCtrl.generateSingleQuoteFile
  )
  .get(
    "/purchase-order/form/:id",
    passport.authenticate("jwt", { session: false }),
    poCtrl.generateSinglePOFile
  )
  .get(
    "/booking/:id",
    passport.authenticate("jwt", { session: false }),
    bookingCtrl.getSingleBooking
  )
  .get(
    '/inventory/form/all/:id',
    passport.authenticate('jwt', { session: false }),
    invCtrl.exportInventory
  )
  .get(
    '/inventory/form/:id',
    passport.authenticate('jwt', { session: false }),
    invCtrl.exportInventoryByKeyPartner
  )
  .get(
    '/monthly-quotation/:start/:end',
    passport.authenticate('jwt', { session: false }),
    quoteCtrl.getMonthlyQuotation
  )
  .get(
    '/monthly-po/:start/:end',
    passport.authenticate('jwt', { session: false }),
    poCtrl.getMonthlyPurchaseOrder
  )
  .get('/report/current/:currDateStart/:currDateEnd', passport.authenticate('jwt', { session: false }), excelCtrl.getTodaysReport)
  .get('/check/password-reset/:token', authCtrl.checkPasswordResetToken)
  .get("/refresh/access", authCtrl.refreshToken);

module.exports = router;
