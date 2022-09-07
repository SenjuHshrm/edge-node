const Quotation = require('../../../models/Quotation')
const Inquiry = require('../../../models/Inquiry')
const User = require('../../../models/User')
const NotificationCount = require('../../../models/NotificationCount')
const generateId = require('../../../utils/id-generator')
const { generateSingleQuotation, generateMultipleQuoatation } = require('../../../services/generate-quotation')

module.exports = {
  /**
   * Create quotation
   */
  createQuotation: async (req, res) => {
    let user = await User.findById(req.body.keyPartnerId).exec()
    let prevQuote = await Quotation.find({ keyPartnerId: req.body.keyPartnerId }).exec()
    let quoteId = generateId(prevQuote, `${user.userId}-Q`)
    new Quotation({
      quotationId: quoteId,
      keyPartnerId: req.body.keyPartnerId,
      quoteFrom: req.body.quoteFrom,
      items: req.body.items,
      isApproved: false,
      validUntil: req.body.validUntil,
      status: 'none'
    }).save().then(async (newQuote) => {
      await Inquiry.findOneAndUpdate({ inqId: newQuote.quoteFrom }, { $set: { isApproved: true } }).exec()
      await NotificationCount.findOneAndUpdate({ userId: newQuote.keyPartnerId }, { $inc: { quotation: 1 } }).exec()
      global.io.emit('new quotation', { id: newQuote.keyPartnerId, info: 1 })
      return res.status(200).json({ success: true, info: newQuote })
    }).catch(e => {
      console.log(e)
      return res.status(500).json({ success: false, msg: '' })
    })
  },

  /**
   * Approve quotation
   */
  approveQuotation: async(req, res) => {
    try {
      await Quotation.findByIdAndUpdate(
        req.params.id,
        { $set: { isApproved: true } }
      ).exec()
      return res.status(200).json({ success: true, msg: 'OK' })
    } catch(e) {
      return res.status(500).json({ success: false, msg: '' })
    }
  },

  /**
   * Get all quotations
   */
  getAllQuotations: async (req, res) => {
    try {
      let quotes = await Quotation.find({}).populate('keyPartnerId', { password: 0, refreshToken: 0, updatedAt: 0, createdAt: 0 }).sort({ createdAt: -1 }).exec()
      return res.status(200).json({ success: true, info: quotes })
    } catch(e) {
      return res.status(500).json({ success: false, msg: '' })
    }
  },

  /**
   * Get quotations filtered by key-partner
   */
  getOuotationsByKeyPartner: async (req, res) => {
    try {
      let quotes = await Quotation.find({ keyPartnerId: req.params.id, status: ['none', 'pending'] }).populate('keyPartnerId', { password: 0, refreshToken: 0, updatedAt: 0, createdAt: 0 }).sort({ createdAt: -1 }).exec()
      return res.status(200).json({ success: true, info: quotes })
    } catch(e) {
      return res.status(500).json({ success: false, msg: '' })
    }
  },

  /**
   * 
   */
  markAsPending: async (req, res) => {
    try {
      await Quotation.findByIdAndUpdate(req.params.id, { $set: { status: req.body.status } }).exec()
      return res.sendStatus(204)
    } catch(e) {
      return res.status(500).json({ success: false, msg: '' })
    }
  },

  /**
   * 
   */
  generateSingleQuoteFile: async (req, res) => {
    try {
      let quote = await Quotation.findOne({ quotationId: req.params.id }).populate('keyPartnerId').exec()
      let file = await generateSingleQuotation(quote)
      return res.status(200).json({ success: true, info: file })
    } catch(e) {
      console.log(e)
      return res.status(500).json({ success: false, msg: '' })
    }
  },

  /**
   * 
   * @param {*} req 
   * @param {*} res 
   * @returns 
   */
  generateMultipleQuoatation: async (req, res) => {
    try {
      let quotes = await Quotation.find({ quotationId: req.body.ids }).populate('keyPartnerId').exec()
      let file = await generateMultipleQuoatation(quotes, req.body.id)
      return res.status(200).json({ success: true, info: file })
    } catch(e) {
      console.log(e)
      return res.status(500).json({ success: false, msg: '' })
    }
  }
}
