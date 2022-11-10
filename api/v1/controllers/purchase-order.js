const PurchaseOrder = require('../../../models/PurchaseOrder')
const Quotation = require('../../../models/Quotation')
const User = require('../../../models/User')
const Inquiry = require('../../../models/Inquiry')
const NotificationCount = require('../../../models/NotificationCount')
const generateId = require('../../../utils/id-generator')
const moment = require('moment')
const { generateSinglePO, generateMultiplePO } = require('../../../services/generate-po')
const writeLog = require('../../../utils/write-log')

module.exports = {
  /**
   * Create purchase order
   * 0003C
   */
  createPurchaseOrder: async (req, res) => {
    let user = await User.findById(req.body.keyPartnerId).exec()
    let prevPO = await PurchaseOrder.find({ keyPartnerId: req.body.keyPartnerId }).exec()
    let poId = generateId(prevPO, user.userId)
    new PurchaseOrder({
      poId: poId,
      keyPartnerId: req.body.keyPartnerId,
      poFrom: req.body.poFrom,
      items: req.body.items,
      seenBy: []
    }).save().then(async (newPO) => {
      let quote = await Quotation.findOneAndUpdate({ quotationId: newPO.poFrom }, { $set: { status: 'approved' } }, { new: true }).exec()
      await Inquiry.findOneAndUpdate({ inqId: quote.quoteFrom }, { $set: { isApproved: "true" } }).exec()
      let admins = await User.find({ accessLvl: [1, 2] }).exec()
      admins.forEach(async admin => {
        await NotificationCount.findOneAndUpdate({ userId: admin._id }, { $inc: { purchaseOrder: 1 }}).exec()
        global.io.emit('new purchase order', { id: admin._id, info: 1 })
      })
      return res.status(200).json({ success: true, info: newPO })
    }).catch(e => {
      writeLog('purchase-order', 'createPurchaseOrder', '0003C', e.stack)
      return res.status(500).json({ success: false, msg: '' })
    })
  },

  /**
   * Get all created purchase order
   * 0003D
   */
  getAllPurchaseOrder: async (req, res) => {
    try {
      let po = await PurchaseOrder.find({}).lean().populate('keyPartnerId', '_id name company contact addr').sort({ createdAt: -1 }).exec()
      return res.status(200).json({ success: true, info: po })
    } catch(e) {
      writeLog('purchase-order', 'getAllPurchaseOrder', '0003D', e.stack)
      return res.status(500).json({ success: false, msg: '' })
    }
  },

  /**
   * Generate purchase order form
   * 0003E
   */
  generateSinglePOFile: async (req, res) => {
    try {
      let po = await PurchaseOrder.findOne({ poId: req.params.id }).lean().populate('keyPartnerId', '_id name company contact addr').exec()
      let poFile = await generateSinglePO(po)
      return res.status(200).json({ success: true, info: poFile })
    } catch(e) {
      writeLog('purchase-order', 'generateSinglePOFile', '0003E', e.stack)
      return res.status(500).json({ success: false, msg: '' })
    }
  },

  /**
   * 0003F
   */
  generateMultiplePO: async (req, res) => {
    try {
      let pos = await PurchaseOrder.find({ poId: req.body.ids }).lean().populate('keyPartnerId', '_id name company contact addr').exec()
      let poFile = await generateMultiplePO(pos, req.body.id)
      return res.status(200).json({ success: true, info: poFile })
    } catch(e) {
      writeLog('purchase-order', 'generateMultiplePO', '0003F', e.stack)
      return res.status(500).json({ success: false, msg: '' })
    }
  },

  /**
   * 00040
   */
   getMonthlyPurchaseOrder: async (req, res) => {
    try {
      let response = [];
      for (let i = 0; i < moment().daysInMonth(); i++) {
        response.push(0);
      }
      let bookings = await PurchaseOrder.find({
        createdAt: { $gte: req.params.start, $lte: req.params.end },
      }).exec();
      for (let i = 0; i < bookings.length; i++) {
        let j = moment(bookings[i].createdAt).format("DD");
        response[parseInt(j) - 1] += 1;
      }
      return res.status(200).json({ succes: true, info: response });
    } catch (e) {
      writeLog('purchase-order', 'getMonthlyPurchaseOrder', '00040', e.stack)
      return res.status(500).json({ success: false, msg: "" });
    }
  },

  /**
   * 00041
   */
  setPOAsSeen: async (req, res) => {
    try {
      await PurchaseOrder.findByIdAndUpdate(req.params.id, { $push: { seenBy: req.body.id } }).exec()
      return res.status(200).json({ success: true, info: req.body.id })
    } catch(e) {
      writeLog('purchase-order', 'setPOAsSeen', '00041', e.stack)
      return res.status(500).json({ success: false, msg: '' })
    }
  }
}
