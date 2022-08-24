const Booking = require("../../../models/Booking");
const Bundle = require("../../../models/Bundle");
const Inventory = require("../../../models/Inventory");
const User = require('../../../models/User')
const generateId = require('../../../utils/id-generator')

module.exports = {
  /**
   *
   */
  createBooking: async (req, res) => {
    let booking = await Booking.find({ keyPartnerId: req.body.keyPartnerId }).exec()
    let user = await User.findById(req.body.keyPartnerId).exec()
    let genId = generateId(booking, user.userId)
    new Booking({
      keyPartnerId: req.body.keyPartnerId,
      bookingId: genId,
      customer: req.body.customer,
      customerContact: req.body.customerContact,
      province: req.body.province,
      city: req.body.city,
      brgy: req.body.brgy,
      hsStNum: req.body.hsStNum,
      zip: req.body.zip,
      courier: req.body.courier,
      cod: req.body.cod,
      sender: req.body.sender,
      senderContact: req.body.senderContact,
      remarks: req.body.remarks,
      itemId: req.body.itemId,
      bundleId: req.body.itemId,
      quantity: req.body.quantity,
      itemType: req.body.itemType,
      status: "unfulfilled",
    })
      .save()
      .then(async newBooking => {
        if (newBooking.itemType === "individual") {
          let inv = await Inventory.findById(newBooking.itemId).exec();
          inv.currentQty = +inv.currentQty - newBooking.quantity;
          inv.out = +inv.out + +newBooking.quantity;
          inv.markModified("currentQty");
          inv.markModified("out");
          inv.save();
        } else {
          await Bundle.findByIdAndUpdate(newBooking.itemId, {
            $set: { status: "out" },
          }).exec();
        }

        let booking = await Booking.findById(newBooking._id)
          .populate({
            path: "itemId",
            model: "inventory",
          })
          .populate({
            path: "bundleId",
            model: "bundle",
          })
          .exec();

        // newBooking.items.forEach(async x => {
        //   if (x.itemType === "individual") {
        //     let inv = await Inventory.findById(x.itemId).exec();
        //     inv.currentQty = +inv.currentQty - x.quantity;
        //     inv.out = +inv.out + +x.quantity;
        //     inv.markModified("currentQty");
        //     inv.markModified("out");
        //     inv.save();
        //   } else if (x.itemType === "bundle") {
        //     await Bundle.findByIdAndUpdate(x.itemId, {
        //       $set: { status: "out" },
        //     }).exec();
        //   }
        // });
        return res.status(200).json({ success: true, info: booking });
      })
      .catch(e => {
        console.log(e);
        return res.status(500).json({ success: false, msg: "" });
      });
  },

  getAllBookingPerKP: async (req, res) => {
    try {
      let bookings = await Booking.find({
        deletedAt: "",
        keyPartnerId: req.params.id,
      })
        .populate({
          path: "itemId",
          model: "inventory",
        })
        .populate({
          path: "bundleId",
          model: "bundle",
        })
        .exec();

      return res.status(200).json({ success: true, info: bookings });
    } catch (e) {
      console.log(e);
      return res.status(500).json({
        success: false,
        msg: "Failed to get the list of bookings record.",
      });
    }
  },

  getAllBookings: async (req, res) => {
    try {
      let bookings = await Booking.find({
        deletedAt: "",
      })
        .populate({
          path: "itemId",
          model: "inventory",
        })
        .populate({
          path: "bundleId",
          model: "bundle",
        })
        .exec();

      return res.status(200).json({ success: true, info: bookings });
    } catch (e) {
      console.log(e);
      return res.status(500).json({
        success: false,
        msg: "Failed to get the list of bookings record.",
      });
    }
  },
};
