const Inventory = require("../../../models/Inventory");
const Classification = require("../../../models/Classification");

module.exports = {
  /**
   * Create inventory for admin
   */
  createInventory: async (req, res) => {
    let items = await Inventory.find({
      deletedAt: "",
    })
      .populate({
        path: "code",
        select: "code",
      })
      .exec();

    let filtered = items.filter(e => e.code.code === req.body.code);
    let sorted = filtered.sort(
      (a, b) => parseInt(b.sequence) - parseInt(a.sequence)
    );

    const format = "00000";
    const count = filtered.length === 0 ? 1 : parseInt(sorted[0].sequence) + 1;
    const countChar = count.toString().length;
    seq = format.substring(0, format.length - countChar) + count.toString();

    new Classification({
      type: "type",
      name: req.body.desc,
      code: req.body.code,
    })
      .save()
      .then(classification => {
        new Inventory({
          keyPartnerId: req.body.keyPartnerId,
          desc: req.body.desc,
          code: classification._id,
          classification: req.body.classification,
          color: req.body.color,
          size: req.body.size,
          sequence: seq,
          movingInv: {
            quantity: req.body.quantity,
            price: req.body.price,
            totalAmt:
              parseFloat(req.body.quantity) * parseFloat(req.body.price),
          },
        })
          .save()
          .then(inventory => {
            return res.status(200).json({ success: true, info: inventory });
          })
          .catch(e => {
            return res.status(500).json({
              success: false,
              msg: "Failed to save a new Item.",
            });
          });
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
          path: "code classification color size",
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
        clone.sku = `SKU-EC-${item.classification?.code}-${item.code?.code}-${item.color?.code}-${item.size?.code}-${item.sequence}`;
        newItems.push(clone);
      });

      return res.status(200).json({ success: true, info: newItems });
    } catch (e) {
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

    if (req.body.codeName !== req.body.code) {
      let items = await Inventory.find({
        deletedAt: "",
      })
        .populate({
          path: "code",
          select: "code",
        })
        .exec();

      let filtered = items.filter(e => e.code.code === req.body.code);
      let sorted = filtered.sort(
        (a, b) => parseInt(b.sequence) - parseInt(a.sequence)
      );

      const format = "00000";
      const count = parseInt(sorted[0].sequence) + 1;
      const countChar = count.toString().length;
      seq = format.substring(0, format.length - countChar) + count.toString();
    }

    try {
      let classification = await Classification.findByIdAndUpdate(
        req.body.codeId,
        {
          name: req.body.desc,
          code: req.body.code,
        },
        {
          new: true,
        }
      ).exec();

      let item = await Inventory.findByIdAndUpdate(
        req.params.id,
        {
          keyPartnerId: req.body.keyPartnerId,
          desc: req.body.desc,
          code: classification._id,
          classification: req.body.classification,
          color: req.body.color,
          size: req.body.size,
          sequence: seq,
          movingInv: {
            quantity: req.body.quantity,
            price: req.body.price,
            totalAmt:
              parseFloat(req.body.quantity) * parseFloat(req.body.price),
          },
        },
        { new: true }
      ).exec();
      return res.status(200).json({ success: true, info: item });
    } catch (e) {
      return res.status(500).json({
        success: false,
        msg: "Failed to update the selected item.",
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
};
