const Customer = require("../../../models/Customer");

module.exports = {
  /*
   * Create customer for admin
   */
  createCustomer: async (req, res) => {
    new Customer({
      name: req.body.name,
      addr: {
        province: req.body.addr.province,
        city: req.body.addr.city,
        brgy: req.body.addr.brgy,
        hsStNum: req.body.addr.hsStNum,
      },
      contact: req.body.contact,
      email: req.body.email,
      keyPartnerId: req.body.keyPartnerId,
    })
      .save()
      .then(customer => {
        return res.status(200).json({ success: true, info: customer });
      })
      .catch(e => {
        return res.status(500).json({
          success: false,
          msg: "Failed to save a new Customer.",
        });
      });
  },

  /*
   * Get all customer
   */
  getAllCustomer: async (req, res) => {
    try {
      let customers = await Customer.find({
        deletedAt: "",
        keyPartnerId: req.params.id,
      }).exec();
      return res.status(200).json({ success: true, info: customers });
    } catch (e) {
      return res.status(500).json({
        success: false,
        msg: "Failed to get the list of customers.",
      });
    }
  },

  /*
   * Get One customer
   */
  getCustomer: async (req, res) => {
    try {
      let customer = await Customer.findOne({
        _id: req.params.id,
      }).exec();
      return res.status(200).json({ success: true, info: customer });
    } catch (e) {
      return res.status(500).json({
        success: false,
        msg: "Failed to get the specific customer.",
      });
    }
  },

  /*
   * Update customer
   */
  updateCustomer: async (req, res) => {
    try {
      let customer = await Customer.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
      }).exec();
      return res.status(200).json({ success: true, info: customer });
    } catch (e) {
      console.log(e);
      return res.status(500).json({
        success: false,
        msg: "Failed to update the selected customer.",
      });
    }
  },

  /*
   * Delete customer
   */
  deleteCustomer: async (req, res) => {
    try {
      await Customer.findByIdAndUpdate(req.params.id, {
        deletedAt: new Date().toLocaleString(),
      }).exec();
      return res.status(200).json({ success: true, info: req.params.id });
    } catch (e) {
      return res.status(500).json({
        success: false,
        msg: "Failed to delete the selected customer.",
      });
    }
  },
};
