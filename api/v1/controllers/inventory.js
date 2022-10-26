const Inventory = require("../../../models/Inventory");
const Classification = require("../../../models/Classification");
const generateInv = require("../../../services/generate-inventory");

module.exports = {
  /**
   * Create inventory for admin
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
        return res.status(500).json({
          success: false,
          msg: "Failed to save a new Item.",
        });
      });
  },
  /*
   * Get all inventory items
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
      console.log(e);
      return res.status(500).json({
        success: false,
        msg: "Failed to get the list of customers.",
      });
    }
  },
  /*
   * Get all inventory items
   */ getAllByKeyPartners: async (req, res) => {
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
      console.log(e);
      return res.status(500).json({
        success: false,
        msg: "Failed to get the list of customers.",
      });
    }
  },
  /**
   * Update inventory for admin
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
      return res.status(500).json({
        success: false,
        msg: "Failed to update the selected item.",
      });
    }
  },
  /**
   * Update up to Many Moving to Non Moving classification
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
      return res.status(500).json({
        success: false,
        msg: "Failed to update the selected items.",
      });
    }
  },
  /**
   * Update up to Many Non Moving to Moving classification
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
      return res.status(500).json({
        success: false,
        msg: "Failed to update the selected items.",
      });
    }
  },

  /**
   * Delete classification
   */
  deleteItem: async (req, res) => {
    try {
      await Inventory.findByIdAndUpdate(req.params.id, {
        deletedAt: new Date().toLocaleString(),
      }).exec();
      return res.status(200).json({ success: true, info: req.params.id });
    } catch (e) {
      return res.status(500).json({
        success: false,
        msg: "Failed to delete the selected classification.",
      });
    }
  },

  deleteSelected: async (req, res) => {
    try {
      let ids = JSON.parse(req.query.ids)
      await Inventory.updateMany({ _id: ids }, { deletedAt: new Date().toLocaleString() }).exec()
      return res.sendStatus(204)
    } catch(e) {
      console.log(e)
      return res.status(500).json({ success: false, msg: '' })
    }
  },

  /**
   *
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
      console.log(e);
      return res.staus(500).json({ success: false, msg: "" });
    }
  },

  exportSelected: async (req, res) => {
    try {
      let inv = await Inventory.find({ _id: req.body.items }).populate('classification').populate('color').populate('size').exec()
      let file = await generateInv(inv, req.body.id)
      return res.status(200).json({ success: true, info: file });
    } catch(e) {
      console.log(e)
      return res.status(500).json({ success: false, msg: '' })
    }
  },

  /**
   *
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
      console.log(e);
      return res.staus(500).json({ success: false, msg: "" });
    }
  },
};
