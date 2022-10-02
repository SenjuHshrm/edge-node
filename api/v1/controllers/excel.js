const Booking = require('../../../models/Booking')
const Quotation = require('../../../models/Quotation')
const PurchaseOrder = require('../../../models/PurchaseOrder')
const generateFlash = require('../../../services/generate-flash')
const generateJNT = require('../../../services/generate-jnt')
const jwt = require('jsonwebtoken')

module.exports = {
  /**
   * Generate excel file for both couriers
   */
  generateExcelAllCourier: async (req, res) => {
    try {
      let token = jwt.decode(req.headers.authorization.split(' ')[1])
      let booking = await Booking.find({ _id: req.body.ids, deletedAt: '' }).populate({ path: 'itemId', populate: { path: 'classification size' } }).exec()
      let flash = booking.filter((x) => { return x.courier === 'flash' })
      let jnt = booking.filter((x) => { return x.courier === 'jnt' })
      let flashExcel = (flash.length > 0) ? await generateFlash(flash, token.sub) : null;
      let jntExcel = (jnt.length > 0) ? await generateJNT(jnt, token.sub) : null;
      return res.status(200).json({ success: true, info: [flashExcel, jntExcel] })
    } catch(e) {
      console.log(e)
      return res.status(500).json({ success: false, msg: '' })
    }
  },

  /**
   * Get report data
   */
  getTodaysReport: async (req, res) => {
    try {
      let bookings = await Booking.countDocuments({ createdAt: { $gte: req.params.currDateStart, $lte: req.params.currDateEnd } }).exec(),
          quotations = await Quotation.countDocuments({ createdAt: { $gte: req.params.currDateStart, $lte: req.params.currDateEnd } }).exec(),
          po = await PurchaseOrder.countDocuments({ createdAt: { $gte: req.params.currDateStart, $lte: req.params.currDateEnd } }).exec();
      return res.status(200).json({ info: { bookings, quotations, po } })
    } catch(e) {
      console.log(e)
      return res.status(500).json({ msg: '' })
    }
  }
}