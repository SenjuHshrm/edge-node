const Bundle = require("../../../models/Bundle");
const Inventory = require("../../../models/Inventory");
const writeLog = require('../../../utils/write-log')

module.exports = {
  /**
   * Create bundled item
   * 00015
   */
  createBundle: async (req, res) => {
    try {
      let bundle = await new Bundle({
        keyPartnerId: req.body.keyPartnerId,
        name: req.body.name,
        items: req.body.items,
        status: "in",
      }).save()
      return res.status(200).json({ success: true, info: bundle });
    } catch(e) {
      writeLog('bundle', 'createBundle', '00015', e.stack)
      return res.status(500).json({ success: false, msg: 'Failed to save a new bundle' })
    }
  },

  /**
   * Get all bundled items per keypartner id
   * 00016
   */
  getAllBundledPerKeyPartners: async (req, res) => {
    try {
      let bundles = await Bundle.find({
        deletedAt: "",
        keyPartnerId: req.params.id,
      }).exec();
      return res.status(200).json({ success: true, info: bundles });
    } catch (e) {
      writeLog('bundle', 'getAllBundledPerKeyPartners', '00016', e.stack)
      return res.status(500).json({
        success: false,
        msg: "Failed to get the list of bundled items.",
      });
    }
  },
  /**
   * Get all bundle by id
   * 00017
   */
  getOneBundle: async (req, res) => {
    try {
      let bundle = await Bundle.findById(req.params.id).exec();
      return res.status(200).json({ success: true, info: bundle });
    } catch (e) {
      writeLog('bundle', 'getOneBundle', '00017', e.stack)
      return res.status(500).json({
        success: false,
        msg: "Failed to get the list of bundled items.",
      });
    }
  },

  /**
   * Update bundled items
   * 00018
   */
  updateBundle: async (req, res) => {
    try {
      let bundle = await Bundle.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
      }).exec();

      return res.status(200).json({ success: true, info: bundle });
    } catch (e) {
      writeLog('bundle', 'updateBundle', '00018', e.stack)
      return res.status(500).json({
        success: false,
        msg: "Failed to update the selected bundle item.",
      });
    }
  },

  /**
   * Delete bundle
   * 00019
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
      writeLog('bundle', 'deleteBundle', '00019', e.stack)
      return res.status(500).json({
        success: false,
        msg: "Failed to delete the selected bundle item.",
      });
    }
  },
};
