const PurchaseOrder = require('../../../models/PurchaseOrder')
const Quotation = require('../../../models/Quotation')
const User = require('../../../models/User')
const Inquiry = require('../../../models/Inquiry')
const NotificationCount = require('../../../models/NotificationCount')
const generateId = require('../../../utils/id-generator')
const { generateSinglePO, generateMultiplePO } = require('../../../services/generate-po')

module.exports = {
  /**
   * Create purchase order
   */
  createPurchaseOrder: async (req, res) => {
    let user = await User.findById(req.body.keyPartnerId).exec()
    let prevPO = await PurchaseOrder.find({ keyPartnerId: req.body.keyPartnerId }).exec()
    let poId = generateId(prevPO, user.userId)
    new PurchaseOrder({
      poId: poId,
      keyPartnerId: req.body.keyPartnerId,
      poFrom: req.body.poFrom,
      items: req.body.items
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
      console.log(e)
      return res.status(500).json({ success: false, msg: '' })
    })
  },

  /**
   * Get all created purchase order
   */
  getAllPurchaseOrder: async (req, res) => {
    try {
      let po = await PurchaseOrder.find({}).populate('keyPartnerId', { password: 0, refreshToken: 0, updatedAt: 0, createdAt: 0 }).sort({ createdAt: -1 }).exec()
      return res.status(200).json({ success: true, info: po })
    } catch(e) {
      console.log(e)
      return res.status(500).json({ success: false, msg: '' })
    }
  },

  /**
   * Generate purchase order form
   */
  generateSinglePOFile: async (req, res) => {
    try {
      let po = await PurchaseOrder.findOne({ poId: req.params.id }).populate('keyPartnerId').exec()
      let poFile = await generateSinglePO(po)
      return res.status(200).json({ success: true, info: poFile })
    } catch(e) {
      console.log(e)
      return res.status(500).json({ success: false, msg: '' })
    }
  },

  /**
   * 
   */
  generateMultiplePO: async (req, res) => {
    try {
      let pos = await PurchaseOrder.find({ poId: req.body.ids }).populate('keyPartnerId').exec()
      let poFile = await generateMultiplePO(pos, req.body.id)
      return res.status(200).json({ success: true, info: poFile })
    } catch(e) {
      console.log(e)
      return res.status(500).json({ success: false, msg: '' })
    }
  }
}
