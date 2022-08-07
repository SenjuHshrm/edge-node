const Inquiry = require('../../../models/Inquiry')
const generateId = require('../../../utils/id-generator')

module.exports = {

  /**
   * Create inquiry to admin
   */
  createInquiry: async (req, res) => {
    let prevInq = await Inquiry.find({}).exec()
    let inqId = generateId(prevInq, 'INQ')
    new Inquiry({
      inqId: inqId,
      keyPartnerId: req.body.keyPartnerId,
      items: req.body.items,
      isApproved: false
    }).save().then(newInq => {
      newInq.populate('keyPartnerId')
      let { inqId, createdAt, items, keyPartnerId: { name, email, company } } = newInq
      return res.status(200).json({ succes: true, info: {
        inqId, createdAt, items, keyPartnerId: { name, email, company }
      } })
    }).catch(e => {
      return res.status(500).json({ success: false, msg: '' })
    })
  },
  
  /**
   * Approve inquiry
   */
  approveInquiry: async (req, res) => {
    try {
      await Inquiry.findByIdAndUpdate(
        req.params.inqId,
        { $set: { isApproved: true } }
      ).exec()
      return res.status(200).json({ success: true, msg: 'OK' })
    } catch(e) {
      return res.status(500).json({ success: false, msg: '' })
    }
  },

  /**
   * Get all inquiries
   */
  getAllInquiries: async (req, res) => {
    try {
      let inquiries = await Inquiry.find({}).exec()
      return res.status(200).json({ success: true, info: inquiries })
    } catch(e) {
      return res.status(500).json({ success: false, msg: '' })
    }
  },

  /**
   * Get inquiry filtered by key-partner
   */
  getInquiriesByKeyPartner: async (req, res) => {
    try {
      let response = []
      let inquiries = await Inquiry.find({ keyPartnerId: req.params.id }).populate('keyPartnerId').exec()
      inquiries.forEach(inq => {
        let { inqId, createdAt, items, keyPartnerId: { name, email, company } } = inq
        response.push({
          inqId,
          createdAt,
          items,
          keyPartnerId: {
            name,
            email,
            company
          }
        })
      })
      return res.status(200).json({ success: true, info: response })
    } catch(e) {
      console.log(e)
      return res.status(500).json({ success: false, msg: '' })
    }
  }


}