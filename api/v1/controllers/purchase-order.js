const PurchaseOrder = require('../../../models/PurchaseOrder')
const Quotation = require('../../../models/Quotation')
const User = require('../../../models/User')
const generateId = require('../../../utils/id-generator')

module.exports = {
  /**
   * Create purchase order
   */
  createPurchaseOrder: async (req, res) => {
    let user = await User.findById(req.body.keyPartnerId).exec()
    let prevPO = await PurchaseOrder.find({}).exec()
    let poId = generateId(prevPO, user.userId)
    new PurchaseOrder({
      poId: poId,
      keyPartnerId: req.body.keyPartnerId,
      poFrom: req.body.poFrom,
      items: req.body.items
    }).save().then(async (newPO) => {
      await Quotation.findOneAndUpdate({ quotationId: newPO.poFrom }, { $set: { status: 'approved' } }).exec()
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
      let po = await PurchaseOrder.find({}).exec()
      return res.status(200).json({ success: true, info: po })
    } catch(e) {
      console.log(e)
      return res.status(500).json({ success: false, msg: '' })
    }
  }
}