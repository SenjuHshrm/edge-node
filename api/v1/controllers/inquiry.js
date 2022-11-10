const Inquiry = require('../../../models/Inquiry')
const generateId = require('../../../utils/id-generator')
const NotificationCount = require('../../../models/NotificationCount')
const User = require('../../../models/User')
const { generateSingleInquiry, generateMultipleInquiry } = require('../../../services/generate-inquiry')
const writeLog = require('../../../utils/write-log')

module.exports = {

  /**
   * Create inquiry to admin
   * 0002B
   */
  createInquiry: async (req, res) => {
    let prevInq = await Inquiry.find({}).exec()
    let inqId = generateId(prevInq, 'INQ')
    new Inquiry({
      inqId: inqId,
      keyPartnerId: req.body.keyPartnerId,
      items: req.body.items,
      isApproved: 'pending'
    }).save().then(async (newInq) => {
      newInq.populate('keyPartnerId')
      let { inqId, createdAt, items, isApproved, keyPartnerId: { name, email, company } } = newInq
      let admins = await User.find({ accessLvl: [1, 2] }).exec()
      admins.forEach(async admin => {
        await NotificationCount.findOneAndUpdate({ userId: admin._id }, { $inc: { inquiry: 1 } }).exec()
        global.io.emit('new inquiry' , { id: admin._id, info: 1 })
      })
      return res.status(200).json({ succes: true, info: {
        inqId, createdAt, items, isApproved, keyPartnerId: { name, email, company }
      } })
    }).catch(e => {
      writeLog('inquiry', 'createInquiry', '0002B', e.stack)
      return res.status(500).json({ success: false, msg: '' })
    })
  },
  
  /**
   * Approve inquiry
   * 0002C
   */
  approveInquiry: async (req, res) => {
    try {
      await Inquiry.findByIdAndUpdate(
        req.params.inqId,
        { $set: { isApproved: 'true' } }
      ).exec()
      return res.status(200).json({ success: true, msg: 'OK' })
    } catch(e) {
      writeLog('inquiry', 'approveInquiry', '0002C', e.stack)
      return res.status(500).json({ success: false, msg: '' })
    }
  },

  /**
   * Get all inquiries
   * 0002D
   */
  getAllInquiries: async (req, res) => {
    try {
      let response = []
      let inquiries = await Inquiry.find({}).populate('keyPartnerId').sort({ createdAt: -1 }).exec()
      inquiries.forEach(inq => {
        let { inqId, createdAt, items, isApproved, keyPartnerId: { _id, name, email, company, addr } } = inq
        response.push({
          inqId,
          createdAt,
          items,
          isApproved,
          keyPartnerId: {
            _id,
            name,
            email,
            company,
            addr
          }
        })
      })
      return res.status(200).json({ success: true, info: response })
    } catch(e) {
      writeLog('inquiry', 'getAllInquiries', '0002D', e.stack)
      return res.status(500).json({ success: false, msg: '' })
    }
  },

  /**
   * Get inquiry filtered by key-partner
   * 0002E
   */
  getInquiriesByKeyPartner: async (req, res) => {
    try {
      let response = []
      let inquiries = await Inquiry.find({ keyPartnerId: req.params.id }).populate('keyPartnerId').sort({ createdAt: -1 }).exec()
      inquiries.forEach(inq => {
        let { inqId, createdAt, items, isApproved, keyPartnerId: { name, email, company, addr } } = inq
        response.push({
          inqId,
          createdAt,
          items,
          isApproved,
          keyPartnerId: {
            name,
            email,
            company,
            addr
          }
        })
      })
      return res.status(200).json({ success: true, info: response })
    } catch(e) {
      writeLog('inquiry', 'getInquiriesByKeyPartner', '0002E', e.stack)
      return res.status(500).json({ success: false, msg: '' })
    }
  },

  /**
   * Generate single inquiry form
   * 0002F
   */
  generateSingleInquiryForm: async (req, res) => {
    try {
      let inq = await Inquiry.findOne({ inqId: req.params.id }).populate('keyPartnerId').exec()
      let inqFile = await generateSingleInquiry(inq)
      return res.status(200).json({ success: true, info: inqFile })
    } catch(e) {
      writeLog('inquiry', 'generateSingleInquiryForm', '0002F', e.stack)
      return res.status(500).json({ success: false, msg: '' })
    }
  },

  /**
   * Generate multiple inquiry form
   * 00030
   */
  generateMultipleInquiry: async (req, res) => {
    try {
      let inq = await Inquiry.find({ inqId: req.body.ids }).exec()
      let inqFile = await generateMultipleInquiry(inq, req.body.id)
      return res.status(200).json({ success: true, info: inqFile })
    } catch(e) {
      writeLog('inquiry', 'generateMultipleInquiry', '00030', e.stack)
      return res.status(500).json({ success: false, msg: '' })
    }
  }

}
