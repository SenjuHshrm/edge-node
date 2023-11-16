const ApiKey = require("../../../models/ApiKey")
const writeLog = require("../../../utils/write-log")
const { encryptData } = require('./../../../utils/encrypt')

module.exports = {
  
  /**
   * Get Open API client list
   */
  getClientList: async (req, res) => {
    try {
      let filter = (req.query.filter) ? JSON.parse(req.query.filter) : undefined
      if(filter) {
        filter.client = new RegExp(filter.client, 'gi')
      }
      let clients = (filter) ? await ApiKey.find(filter).exec() : await ApiKey.find().exec()
      let resp = clients.map((client) => {
        client.key = (client.key) ? '**********' : 'No Generated Key';
        return client
      })
      return res.status(200).json({ success: true, info: resp })
    } catch(e) {
      // AKY-0001
      writeLog('api-key', 'getClientList', 'AKY-0001', e.stack)
      return res.status(500).json({ success: false, msg: 'Failed to get client list' })
    }
  },

  /**
   * Add client accessing Open API
   * 
   */
  addClient: async (req, res) => {
    try {
      let checkClient = await ApiKey.findOne({ client: req.body.client }).exec()
      if(checkClient) return res.status(400).json({ success: false, msg: 'Client already existing' })
      let newClient = await new ApiKey({ client: req.body.client }).save()
      return res.status(201).json({ success: true, info: newClient })
    } catch(e) {
      // AKY-0002
      writeLog('api-key', 'addClient', 'AKY-0002', e.stack)
      return res.status(500).json({ success: false, msg: 'Failed to add client' })
    }
  },

  /**
   * Generate API key for specific client
   */
  generateApiKey: async (req, res) => {
    try {
      let key = encryptData(new Date().getTime())
      await ApiKey.findByIdAndUpdate(req.params.id, { $set: { key } })
      return res.status(200).json({ success: true, info: { key } })
    } catch(e) {
      // AKY-0003
      writeLog('api-key', 'generateApiKey', 'AKY-0003', e.stack)
      return res.status(500).json({ success: false, msg: 'Failed to generate API Key' })
    }
  },

  /**
   * Delete client
   */
  deleteClient: async (req, res) => {
    try {
      await ApiKey.findByIdAndDelete(req.params.id).exec()
      return res.sendStatus(204)
    } catch(e) {
      // AKY-0004
      return res.status(500).json({ success: false, msg: 'Failed to remove client' })
    }
  }
}