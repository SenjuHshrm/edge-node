const Quotation = require('../../../models/Quotation')
const Inquiry = require('../../../models/Inquiry')
const User = require('../../../models/User')
const NotificationCount = require('../../../models/NotificationCount')
const generateId = require('../../../utils/id-generator')
const moment = require('moment')
const { generateSingleQuotation, generateMultipleQuoatation } = require('../../../services/generate-quotation')
const writeLog = require('../../../utils/write-log')

module.exports = {
  /**
   * Create quotation
   * 00042
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
      writeLog('quotation', 'createQuotation', '00042', e.stack)
      return res.status(500).json({ success: false, msg: '' })
    })
  },

  /**
   * Get all quotations
   * 00043
   */
  getAllQuotations: async (req, res) => {
    try {
      let quotes = await Quotation.find({}).lean().populate('keyPartnerId', '_id name company contact addr').sort({ createdAt: -1 }).exec()
      return res.status(200).json({ success: true, info: quotes })
    } catch(e) {
      writeLog('quotation', 'getAllQuotations', '00043', e.stack)
      return res.status(500).json({ success: false, msg: '' })
    }
  },

  /** 
   * 00044
  */
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
      writeLog('quotation', 'getForRequote', '00044', e.stack)
      return res.status(500).json({ success: false, msg: '' })
    }
  },

  /**
   * Get quotations filtered by key-partner
   * 00045
   */
  getOuotationsByKeyPartner: async (req, res) => {
    try {
      let quotes = await Quotation.find({ keyPartnerId: req.params.id }).lean().populate('keyPartnerId', '_id name company contact addr').sort({ createdAt: -1 }).exec()
      return res.status(200).json({ success: true, info: quotes })
    } catch(e) {
      writeLog('quotation', 'getQuotationsByKeyPartner', '00045', e.stack)
      return res.status(500).json({ success: false, msg: '' })
    }
  },

  /**
   * 00046
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
        writeLog('quotation', 'markAsPending', '00046', e.stack)
        return res.status(500).json({ success: false, msg: '' })
      })
  },

  /**
   * 00047
   */
  generateSingleQuoteFile: async (req, res) => {
    try {
      let quote = await Quotation.findOne({ quotationId: req.params.id }).lean().populate('keyPartnerId', '_id name company contact addr').exec()
      let file = await generateSingleQuotation(quote)
      return res.status(200).json({ success: true, info: file })
    } catch(e) {
      writeLog('quotation', 'generateSingleQuoteFile', '00047', e.stack)
      return res.status(500).json({ success: false, msg: '' })
    }
  },

  /**
   * 00048
   */
  generateMultipleQuoatation: async (req, res) => {
    try {
      let quotes = await Quotation.find({ quotationId: req.body.ids }).lean().populate('keyPartnerId', '_id name company contact addr').exec()
      let file = await generateMultipleQuoatation(quotes, req.body.id)
      return res.status(200).json({ success: true, info: file })
    } catch(e) {
      writeLog('quotation', 'generateMultipleQuotation', '00048', e.stack)
      return res.status(500).json({ success: false, msg: '' })
    }
  },

  /**
   * 00049
   */
  getMonthlyQuotation: async (req, res) => {
    try {
      let response = []
      for (let i = 0; i < moment().daysInMonth(); i++) {
        response.push(0)
      }
      let quotes = await Quotation.find({ createdAt: { $gte: req.params.start, $lte: req.params.end } }).exec()
      for(let i = 0; i < quotes.length; i++) {
        let j = moment(quotes[i].createdAt).format('DD')
        response[parseInt(j) - 1] += 1
      }
      return res.status(200).json({ success: true, info: response })
    } catch(e) {
      writeLog('quotation', 'getMonthlyQuotation', '00049', e.stack)
      return res.status(500).json({ success: false, msg: '' })
    }
  }
}
