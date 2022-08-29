const mongoose = require('mongoose')
const { ObjectId } = mongoose.Schema

let counterSchema = new mongoose.Schema({
  count: Number,
  isOpened: Boolean
})

let notificationSchema = new mongoose.Schema({
  userId: { type: ObjectId, ref: 'user' },
  //admin
  inquiry: Number,
  purchaseOrder: Number,
  acctReq: Number,
  adminInv: Number,
  //keypartner
  coanda: Number,
  soa: Number,
  quotation: Number,
  kpInv: Number
})

let NotificationCount = mongoose.model('notification-count', notificationSchema)

module.exports = NotificationCount