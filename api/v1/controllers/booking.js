const Booking = require('../../../models/Booking')

module.exports = {

  /**
   * 
   */
  createBooking: (req, res) => {
    new Booking({
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
      items: [itemSchema]
    }).save().then(newBooking => {
      return res.status(200).json({ success: true, info: newBooking })
    }).catch(e => {
      return res.status(500).json({ success: false, msg: '' })
    })
  }
}