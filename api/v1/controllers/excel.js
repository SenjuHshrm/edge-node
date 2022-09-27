const Booking = require('../../../models/Booking')
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
      let booking = await Booking.find({ _id: req.body.ids, deletedAt: '' }).populate({ path: 'itemId', populate: { path: 'classification size' } }).populate('bundleId').exec()
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
   * Generate excel file for jnt
   */
  generateExcelJNT: async (req, res) => {

  },

  /**
   * Generate excel file for Flash
   */
  generateExcelFlash: async (req, res) => {

  }
}