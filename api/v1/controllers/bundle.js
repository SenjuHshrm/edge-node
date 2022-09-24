const Bundle = require("../../../models/Bundle");
const Inventory = require("../../../models/Inventory");

module.exports = {
  /**
   * Create bundled item
   */
  createBundle: async (req, res) => {
    // new Bundle({
    //   keyPartnerId: req.body.keyPartnerId,
    //   name: req.body.name,
    //   items: req.body.items,
    //   status: "in",
    // })
    //   .save()
    //   .then(bundle => {
    //     req.body.items.forEach(async x => {
    //       console.log(x);
    //       let inv = await Inventory.findById(x.itemId).exec();
    //       inv.currentQty = +inv.currentQty - x.quantity;
    //       inv.markModified("currentQty");
    //       inv.save();
    //     });
    //     return res.status(200).json({ success: true, info: bundle });
    //   })
    //   .catch(e => {
    //     return res.status(500).json({
    //       success: false,
    //       msg: "Failed to save a new Bundled Item.",
    //     });
    //   });
    try {
      let bundle = await new Bundle({
        keyPartnerId: req.body.keyPartnerId,
        name: req.body.name,
        items: req.body.items,
        status: "in",
      }).save()
      return res.status(200).json({ success: true, info: bundle });
    } catch(e) {
      return res.status(500).json({ success: false, msg: 'Failed to save a new bundle' })
    }
  },

  /**
   * Get all bundled items per keypartner id
   */
  getAllBundledPerKeyPartners: async (req, res) => {
    try {
      let bundles = await Bundle.find({
        deletedAt: "",
        keyPartnerId: req.params.id,
        status: { $ne: "out" },
      }).exec();
      return res.status(200).json({ success: true, info: bundles });
    } catch (e) {
      return res.status(500).json({
        success: false,
        msg: "Failed to get the list of bundled items.",
      });
    }
  },
  /**
   * Get all bundle by id
   */
  getOneBundle: async (req, res) => {
    try {
      let bundle = await Bundle.findById(req.params.id).exec();
      return res.status(200).json({ success: true, info: bundle });
    } catch (e) {
      return res.status(500).json({
        success: false,
        msg: "Failed to get the list of bundled items.",
      });
    }
  },

  /**
   * Update bundled items
   */
  updateBundle: async (req, res) => {
    try {
      let bundle = await Bundle.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
      }).exec();

      return res.status(200).json({ success: true, info: bundle });
    } catch (e) {
      return res.status(500).json({
        success: false,
        msg: "Failed to update the selected bundle item.",
      });
    }
  },

  /**
   * Delete bundle
   */
  deleteBundle: async (req, res) => {
    try {
      let bundle = await Bundle.findById(req.params.id).exec();
      bundle.items.map(async item => {
        const current = await Inventory.findById(item.itemId).exec();
        let currentBundle =
          parseFloat(current.currentQty) + parseFloat(item.quantity);
        await Inventory.findByIdAndUpdate(item.itemId, {
          $set: { currentQty: currentBundle },
        }).exec();
      });

      await Bundle.findByIdAndUpdate(req.params.id, {
        deletedAt: new Date().toLocaleString(),
      }).exec();
      return res.status(200).json({ success: true, info: req.params.id });
    } catch (e) {
      return res.status(500).json({
        success: false,
        msg: "Failed to delete the selected bundle item.",
      });
    }
  },
};
