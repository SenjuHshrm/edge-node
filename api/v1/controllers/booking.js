const Booking = require('../../../models/Booking')
const Bundle = require('../../../models/Bundle')
const Inventory = require('../../../models/Inventory')

module.exports = {

  /**
   * 
   */
  createBooking: (req, res) => {
    new Booking({
      keyPartnerId: req.body.keyPartnerId,
      customer: req.body.customer,
      customerContact: req.body.customerContact,
      province: req.body.province,
      city: req.body.city,
      brgy: req.body.brgy,
      hsStNum: req.body.hsStNum,
      zip: req.body.zip,
      courier: req.body.courier,
      product: req.body.product,
      quantity: req.body.quantity,
      cod: req.body.cod,
      sender: req.body.sender,
      senderContact: req.body.senderContact,
      remarks: req.body.remarks,
      items: req.body.items,
      status: 'unfulfilled'
    }).save().then(async newBooking => {
      newBooking.items.forEach(async x => {
        if(x.itemType === 'individual') {
          let inv = await Inventory.findById(x.itemId).exec()
          inv.currentQty = +inv.currentQty - x.quantity
          inv.out = +inv.out + +x.quantity
          inv.markModified('currentQty')
          inv.markModified('out')
          inv.save()
        } else if(x.itemType === 'bundle'){
          await Bundle.findByIdAndUpdate(x.itemId, { $set: { status: 'out' } }).exec()
        }
      })
      return res.status(200).json({ success: true, info: newBooking })
    }).catch(e => {
      return res.status(500).json({ success: false, msg: '' })
    })
  }
}