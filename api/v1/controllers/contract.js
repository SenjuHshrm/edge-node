const Contract = require('../../../models/Contract')
const User = require('../../../models/User')

module.exports = {

  /**
   * Get sending history of coa/nda and soa
   */
  getContractSendingHistory: async (req, res) => {
    try {
      let contract = await Contract.find({ contract: req.params.type }).populate('keyPartner', { _id: 1, company: 1, email: 1, name: 1, file: 1 }).sort({ createdAt: -1 }).exec()
      return res.status(200).json({ success: true, info: contract })
    } catch (e) {
      return res.status(500).json({ success: false, msg: '' })
    }
  },

  /**
   * Save contract
   */
  saveContract: async (req, res) => {
    let filename = `/contract/${req.body.filename}`
    let cont = new Contract({
      keyPartner: req.body.id,
      contract: req.body.type,
      file: filename
    })
    await cont.save()
    cont.populate('keyPartner', { _id: 1, company: 1, email: 1, name: 1, file: 1 })
      .then(contRec => {
        let resp = {
          ...contRec._doc
        }
        return res.status(200).json({ success: true, info: resp })
      })
      .catch(e => {
        return res.status(500).json({ success: false, msg: '' })
      })
  }


}