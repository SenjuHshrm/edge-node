const Contract = require('../../../models/Contract')
const File = require('../../../models/File')
const User = require('../../../models/User')
const NotificationCount = require('../../../models/NotificationCount')
const writeLog = require('../../../utils/write-log')

module.exports = {

  /**
   * Get sending history of coa/nda and soa
   * 00020
   */
  getContractSendingHistory: async (req, res) => {
    try {
      let contract = await Contract.find({ contract: req.params.type }).populate('keyPartner', { _id: 1, company: 1, email: 1, name: 1, file: 1 }).sort({ createdAt: -1 }).exec()
      return res.status(200).json({ success: true, info: contract })
    } catch (e) {
      writeLog('contract', 'getContractSendingHistory', '00020', e.stack)
      return res.status(500).json({ success: false, msg: '' })
    }
  },

  /**
   * Save contract
   * 00021
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
      .then(async contRec => {
        let resp = {
          ...contRec._doc
        }
        let field = req.body.type === 'soa' ? 'soa' : 'coanda'
        let fileFromDB = await File.findOne({ filePath: filename }).exec()
        if(fileFromDB === null) {
          await new File({ filePath: filename, from: { collection: 'contract', id: resp._id } }).save()
        }
        await NotificationCount.findOneAndUpdate({ userId: req.body.id }, { $inc: { [field]: 1 } }).exec()
        global.io.emit(`new ${req.body.type}`, { id: req.body.id, info: 1 })
        return res.status(200).json({ success: true, info: resp })
      })
      .catch(e => {
        writeLog('contract', 'saveContract', '00021', e.stack)
        return res.status(500).json({ success: false, msg: '' })
      })
  },

  /**
   * 00022
   */
  getContractByKeyPartner: async (req, res) => {
    try {
      let c = await Contract.find({ keyPartnerId: req.params.id, contract: req.params.type }).sort({ createdAt: -1 }).exec()
      return res.status(200).json({ success: true, info: c })
    } catch(e) {
      writeLog('contract', 'getContractByKeyPartner', '00022', e.stack)
      return res.status(500).json({ success: false, msg: '' })
    }
  },

  /**
   * 00023
   */
  markAsSeen: async (req, res) => {
    try {
      await Contract.findByIdAndUpdate(req.params.id, { $set: { isSeen: true } }).exec()
      return res.status(200).json({ success: true, info: req.params.id })
    } catch(e) {
      writeLog('contract', 'markAsSeen', '00023', e.stack)
      return res.sendStatus(500)
    }
  }


}