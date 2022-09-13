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
      await Inquiry.findOneAndUpdate({ inqId: newQuote.quoteFrom }, { $set: { isApproved: 'pending' } }).exec()
      await NotificationCount.findOneAndUpdate({ userId: newQuote.keyPartnerId }, { $inc: { quotation: 1 } }).exec()
      global.io.emit('new quotation', { id: newQuote.keyPartnerId, info: 1 })
      return res.status(200).json({ success: true, info: newQuote })
    }).catch(e => {
      console.log(e)
      return res.status(500).json({ success: false, msg: '' })
    })
  },

  // /**
  //  * Approve quotation
  //  */
  // approveQuotation: async(req, res) => {
  //   try {
  //     await Quotation.findByIdAndUpdate(
  //       req.params.id,
  //       { $set: { status: true } }
  //     ).exec()
  //     return res.status(200).json({ success: true, msg: 'OK' })
  //   } catch(e) {
  //     return res.status(500).json({ success: false, msg: '' })
  //   }
  // },

  /**
   * Get all quotations
   */
  getAllQuotations: async (req, res) => {
    try {
      let quotes = await Quotation.find({}).lean().populate('keyPartnerId', '_id name company contact addr').sort({ createdAt: -1 }).exec()
      return res.status(200).json({ success: true, info: quotes })
    } catch(e) {
      return res.status(500).json({ success: false, msg: '' })
    }
  },

  getForRequote: async (req, res) => {
    try {
      let resp = []
      let quotes = await Quotation.find({ status: 'declined' }).sort({ createdAt: -1 }).exec()
      for(let i = 0; i < quotes.length; i++) {
        let inq = await Inquiry.findOne({ inqId: quotes[i].quoteFrom }).lean().populate('keyPartnerId', '_id name company contact addr').exec()
        resp.push(inq)
      }
      return res.status(200).json({ success: true, info: resp })
    } catch(e) {
      console.log(e)
      return res.status(500).json({ success: false, msg: '' })
    }
  },

  /**
   * Get quotations filtered by key-partner
   */
  getOuotationsByKeyPartner: async (req, res) => {
    try {
      let quotes = await Quotation.find({ keyPartnerId: req.params.id }).lean().populate('keyPartnerId', '_id name company contact addr').sort({ createdAt: -1 }).exec()
      return res.status(200).json({ success: true, info: quotes })
    } catch(e) {
      return res.status(500).json({ success: false, msg: '' })
    }
  },

  /**
   * 
   */
  markAsPending: (req, res) => {
    Quotation.findByIdAndUpdate(req.params.id, { $set: { status: req.body.status } }, { new: true })
      .then( async quote => {
        if(req.body.status === 'declined') {
          await Inquiry.findOneAndUpdate({ inqId: quote.quoteFrom }, { $set: { isApproved: 'requote' } }).exec()
        }
        return res.sendStatus(204)
      })
      .catch(e => {
        return res.status(500).json({ success: false, msg: '' })
      })
  },

  /**
   * 
   */
  generateSingleQuoteFile: async (req, res) => {
    try {
      let quote = await Quotation.findOne({ quotationId: req.params.id }).lean().populate('keyPartnerId', '_id name company contact addr').exec()
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
      let quotes = await Quotation.find({ quotationId: req.body.ids }).lean().populate('keyPartnerId', '_id name company contact addr').exec()
      let file = await generateMultipleQuoatation(quotes, req.body.id)
      return res.status(200).json({ success: true, info: file })
    } catch(e) {
      console.log(e)
      return res.status(500).json({ success: false, msg: '' })
    }
  }
}
