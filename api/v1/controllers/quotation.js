const Quotation = require('../../../models/Quotation')
const Inquiry = require('../../../models/Inquiry')
const generateId = require('../../../utils/id-generator')

module.exports = {
  /**
   * Create quotation
   */
  createQuotation: async (req, res) => {
    let prevQuote = await Quotation.find({}).exec()
    let quoteId = generateId(prevQuote, 'QUOTE')
    new Quotation({
      quotationId: quoteId,
      keyPartnerId: req.body.keyPartnerId,
      quoteFrom: req.body.quoteFrom,
      items: req.body.items,
      isApproved: false,
      validUntil: req.body.validUntil
    }).save().then(async (newQuote) => {
      await Inquiry.findOneAndUpdate({ inqId: newQuote.quoteFrom }, { $set: { isApproved: true } }).exec()
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
      let quotes = await Quotation.find({}).exec()
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
      let quotes = await Quotation.find({ keyPartnerId: req.params.id }).exec()
      return res.status(200).json({ success: true, info: quotes })
    } catch(e) {
      return res.status(500).json({ success: false, msg: '' })
    }
  }
}