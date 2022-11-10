const Inventory = require("../../../models/Inventory");
const Classification = require("../../../models/Classification");
const generateInv = require("../../../services/generate-inventory");
const writeLog = require('../../../utils/write-log')

module.exports = {
  /**
   * Create inventory for admin
   * 00031
   */
  createInventory: async (req, res) => {
    let items = await Inventory.find({
      deletedAt: "",
    }).exec();
    let filtered = items.filter(e => e.classification.toString() === req.body.classification);
    let sorted = filtered.sort(
      (a, b) => parseInt(b.sequence) - parseInt(a.sequence)
    );

    const format = "00000";
    const count = filtered.length === 0 ? 1 : parseInt(sorted[0].sequence) + 1;
    const countChar = count.toString().length;
    seq = format.substring(0, format.length - countChar) + count.toString();

    new Inventory({
      keyPartnerId: req.body.keyPartnerId,
      desc: req.body.desc,
      classification: req.body.classification,
      color: req.body.color,
      size: req.body.size,
      sequence: seq,
      in: "0",
      currentQty: req.body.quantity,
      price: req.body.price,
      criticalBalance: req.body.criticalBalance,
      kpOwned: req.body.kpOwned,
    })
      .save()
      .then(async inventory => {
        let item = await Inventory.findById(inventory._id)
          .populate({
            path: "classification color size",
            select: "code name",
          })
          .populate({
            path: "keyPartnerId",
            select: "email name",
          })
          .exec();

        return res.status(200).json({ success: true, info: item });
      })
      .catch(e => {
        writeLog('inventory', 'createInventory', '00031', e.stack)
        return res.status(500).json({
          success: false,
          msg: "Failed to save a new Item.",
        });
      });
  },
  /**
   * Get all inventory items
   * 00032
   */
  getAllItems: async (req, res) => {
    try {
      let items = await Inventory.find({
        deletedAt: "",
      })
        .populate({
          path: "classification color size",
          select: "code name",
        })
        .populate({
          path: "keyPartnerId",
          select: "email name",
        })
        .exec();
      let newItems = [];
      items.map(item => {
        let clone = { ...item._doc };
        clone.sku = `SKU-EC-${item.classification?.code}-${item.color?.code}-${item.size?.code}-${item.sequence}`;
        newItems.push(clone);
      });

      return res.status(200).json({
        success: true,
        info: newItems.sort(
          (a, b) => Number(b.createdAt) - Number(a.createdAt)
        ),
      });
    } catch (e) {
      writeLog('inventory', 'getAllItems', '00032', e.stack)
      return res.status(500).json({
        success: false,
        msg: "Failed to get the list of customers.",
      });
    }
  },
  /**
   * Get all inventory items
   * 00033
   */
  getAllByKeyPartners: async (req, res) => {
    try {
      let items = await Inventory.find({
        deletedAt: "",
        keyPartnerId: req.params.id,
      })
        .populate({
          path: "classification color size",
          select: "code name",
        })
        .populate({
          path: "keyPartnerId",
          select: "email name",
        })
        .exec();
      let newItems = [];
      items.map(item => {
        let clone = { ...item._doc };
        clone.sku = `SKU-EC-${item.classification?.code}-${item.color?.code}-${item.size?.code}-${item.sequence}`;
        newItems.push(clone);
      });

      return res.status(200).json({
        success: true,
        info: newItems.sort(
          (a, b) => Number(b.createdAt) - Number(a.createdAt)
        ),
      });
    } catch (e) {
      writeLog('inventory', 'getAllByKeyPartners', '00033', e.stack)
      return res.status(500).json({
        success: false,
        msg: "Failed to get the list of customers.",
      });
    }
  },
  /**
   * Update inventory for admin
   * 00034
   */
  updateInventory: async (req, res) => {
    let seq = req.body.sequence;
    try {
      let item = await Inventory.findByIdAndUpdate(
        req.params.id,
        {
          keyPartnerId: req.body.keyPartnerId,
          desc: req.body.desc,
          classification: req.body.classification,
          color: req.body.color,
          size: req.body.size,
          sequence: seq,
          in: req.body.in,
          out: req.body.out,
          rts: req.body.rts,
          defective: req.body.defective,
          currentQty: req.body.currentQty,
          price: req.body.price,
          criticalBalance: req.body.criticalBalance,
          kpOwned: req.body.kpOwned,
        },
        { new: true }
      ).exec();

      let populated = await Inventory.findById(item._id)
        .populate({
          path: "classification color size",
          select: "code name",
        })
        .populate({
          path: "keyPartnerId",
          select: "email name",
        })
        .exec();

      return res.status(200).json({ success: true, info: populated });
    } catch (e) {
      writeLog('inventory', 'updateInventory', '00034', e.stack)
      return res.status(500).json({
        success: false,
        msg: "Failed to update the selected item.",
      });
    }
  },
  /**
   * Update up to Many Moving to Non Moving classification
   * 00035
   */
  updateManyNonMoving: async (req, res) => {
    try {
      req.body.ids.map(async id => {
        await Inventory.findByIdAndUpdate(
          id,
          { status: "non-moving" },
          { new: true }
        ).exec();
      });
      return res.status(200).json({ success: true, info: req.body.ids });
    } catch (e) {
      writeLog('inventory', 'updateManyNonMoving', '00035', e.stack)
      return res.status(500).json({
        success: false,
        msg: "Failed to update the selected items.",
      });
    }
  },
  /**
   * Update up to Many Non Moving to Moving classification
   * 00036
   */
  updateManyMoving: async (req, res) => {
    try {
      req.body.ids.map(async id => {
        await Inventory.findByIdAndUpdate(
          id,
          { status: "moving" },
          { new: true }
        ).exec();
      });
      return res.status(200).json({ success: true, info: req.body.ids });
    } catch (e) {
      writeLog('inventory', 'updateManyMoving', '00036', e.stack)
      return res.status(500).json({
        success: false,
        msg: "Failed to update the selected items.",
      });
    }
  },

  /**
   * Delete classification
   * 00037
   */
  deleteItem: async (req, res) => {
    try {
      await Inventory.findByIdAndUpdate(req.params.id, {
        deletedAt: new Date().toLocaleString(),
      }).exec();
      return res.status(200).json({ success: true, info: req.params.id });
    } catch (e) {
      writeLog('inventory', 'deleteItem', '00037', e.stack)
      return res.status(500).json({
        success: false,
        msg: "Failed to delete the selected classification.",
      });
    }
  },

  /**
   * 00038
   */
  deleteSelected: async (req, res) => {
    try {
      let ids = JSON.parse(req.query.ids)
      await Inventory.updateMany({ _id: ids }, { deletedAt: new Date().toLocaleString() }).exec()
      return res.sendStatus(204)
    } catch(e) {
      writeLog('inventory', 'deleteSelected', '00038', e.stack)
      return res.status(500).json({ success: false, msg: '' })
    }
  },

  /**
   * 00039
   */
  exportInventory: async (req, res) => {
    try {
      let inv = await Inventory.find({ deletedAt: '' })
        .populate("classification")
        .populate("color")
        .populate("size")
        .exec();
      let file = await generateInv(inv, req.params.id);
      return res.status(200).json({ success: true, info: file });
    } catch (e) {
      writeLog('inventory', 'exportInventory', '00039', e.stack)
      return res.staus(500).json({ success: false, msg: "" });
    }
  },

  /**
   * 0003A
   */
  exportSelected: async (req, res) => {
    try {
      let inv = await Inventory.find({ _id: req.body.items }).populate('classification').populate('color').populate('size').exec()
      let file = await generateInv(inv, req.body.id)
      return res.status(200).json({ success: true, info: file });
    } catch(e) {
      writeLog('inventory', 'exportSelected', '0003A', e.stack)
      return res.status(500).json({ success: false, msg: '' })
    }
  },

  /**
   * 0003B
   */
  exportInventoryByKeyPartner: async (req, res) => {
    try {
      let inv = await Inventory.find({ keyPartnerId: req.params.id, deletedAt: '' })
        .populate("classification")
        .populate("color")
        .populate("size")
        .exec();
      let file = await generateInv(inv, req.params.id);
      return res.status(200).json({ success: true, info: file });
    } catch (e) {
      writeLog('inventory', 'exportInventoryByKeyPartner', '0003B', e.stack)
      return res.staus(500).json({ success: false, msg: "" });
    }
  },
};
