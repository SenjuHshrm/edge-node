const mongoose = require('mongoose')
const { ObjectId } = mongoose.Schema

let counterSchema = new mongoose.Schema({
  count: Number,
  isOpened: Boolean
})

let notificationSchema = new mongoose.Schema({
  userId: { type: ObjectId, ref: 'user' },
  purchaseOrder: counterSchema,
  acctReq: counterSchema,
  contract: counterSchema,
  quotation: counterSchema
})

let NotificationCount = mongoose.model('notification-count', notificationSchema)

module.exports = NotificationCount