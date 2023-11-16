const ApiKey = require('./../../../models/ApiKey')
const moment = require('moment')
const { decryptData } = require('./../../../utils/encrypt')

module.exports = async (req, res, next) => {
  if(!req.headers['x-edge-key'] || !req.headers['x-edge-client']) return res.status(401).json({ success: false, msg: 'Unauthorized' })
  let key = req.headers['x-edge-key']
  let client = req.headers['x-edge-client']

  let clientKey = await ApiKey.findOne({ key, client }).exec()

  if(!clientKey) return res.status(404).json({ success: false, msg: 'Client not found' })

  let updatedAt = moment(clientKey.updatedAt).format('MM/DD/YYYY')
  let dec = moment(parseInt(decryptData(key))).format('MM/DD/YYYY')
  if(updatedAt !== dec) return res.status(400).json({ success: false, msg: 'Invalid key' })

  return next()
}