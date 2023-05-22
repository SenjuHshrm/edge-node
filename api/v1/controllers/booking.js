const Booking = require("../../../models/Booking");
const Bundle = require("../../../models/Bundle");
const Inventory = require("../../../models/Inventory");
const User = require("../../../models/User");
const File = require("../../../models/File");
const NotificationCount = require("../../../models/NotificationCount");
const generateId = require("../../../utils/id-generator");
const checkAddr = require('../../../utils/check-address')
const moment = require("moment");
const generateFlash = require("../../../services/generate-flash");
const generateJnt = require("../../../services/generate-jnt");
const jwt = require("jsonwebtoken");
const fs = require("fs");
const writeLog = require('../../../utils/write-log')

module.exports = {
  /**
   *00008
   */
  createBooking: async (req, res) => {
    try {
      let inv = null;
      if(req.body.itemType === 'individual') {
        inv = await Inventory.findById(req.body.itemId).exec()
        if(+inv.currentQty < +req.body.quantity) {
          return res.status(409).json({ success: false, msg: 'Selected item quantity is not enough to proceed booking process.' })
        }
      } else if(req.body.itemType === 'bundle') {
        for(let i = 0; i < req.body.bundleId.items.length; i++) {
          inv = await Inventory.findById(req.body.bundleId.items[i].itemId).exec()
          if(+inv.currentQty < +req.body.bundleId.items[i].quantity) {
            return res.status(409).json({ success: false, msg: 'Please check if the items in the bundle are enough' })
            break;
          }
        }
      }
      let b = await Booking.find({
        keyPartnerId: req.body.keyPartnerId,
      }).exec();
      let user = await User.findById(req.body.keyPartnerId).exec();
      let genId = generateId(b, user.userId);
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
        bundleId: req.body.bundleId,
        quantity: req.body.itemType === "individual" ? req.body.quantity : "1",
        itemType: req.body.itemType,
        status: "unfulfilled",
        deletedAt: "",
      }).save().then(async newBooking => {
        if (newBooking.itemType === "individual") {
          let inv = await Inventory.findById(newBooking.itemId).exec();
          inv.currentQty = +inv.currentQty - newBooking.quantity;
          inv.out = +inv.out + +newBooking.quantity;
          inv.save();
          if (+inv.currentQty <= +inv.criticalBalance) {
            let admins = await User.find({ accessLvl: [1, 2] }).exec();
            admins.forEach(async admin => {
              await NotificationCount.findOneAndUpdate(
                { userId: admin._id },
                { $inc: { adminInv: 1 } }
              ).exec();
              global.io.emit("admin inventory warning", {
                id: admin._id,
                info: 1,
              });
            });
            await NotificationCount.findOneAndUpdate(
              { userId: req.body.keyPartnerId },
              { $inc: { kpInv: 1 } }
            ).exec();
            global.io.emit("keypartner inventory warning", {
              id: req.body.keyPartnerId,
              info: 1,
            });
          }
        } else {
          req.body.bundleId.items.map(async item => {
            let inv = await Inventory.findById(item.itemId).exec();
            inv.currentQty = +inv.currentQty - +item.quantity;
            inv.out = +inv.out + +item.quantity;
            inv.save();
            if (+inv.currentQty <= +inv.criticalBalance) {
              let admins = await User.find({ accessLvl: [1, 2] }).exec();
              admins.forEach(async admin => {
                await NotificationCount.findOneAndUpdate(
                  { userId: admin._id },
                  { $inc: { adminInv: 1 } }
                ).exec();
                global.io.emit("admin inventory warning", {
                  id: admin._id,
                  info: 1,
                });
              });
              await NotificationCount.findOneAndUpdate(
                { userId: req.body.keyPartnerId },
                { $inc: { kpInv: 1 } }
              ).exec();
              global.io.emit("keypartner inventory warning", {
                id: req.body.keyPartnerId,
                info: 1,
              });
            }
          });
        }
        let booking = await Booking.findById(newBooking._id)
          .populate({
            path: "itemId",
            model: "inventory",
          }).exec();
        return res.status(200).json({ success: true, info: booking })
      })
      .catch(e => {
        console.log(e);
        return res.status(500).json({ success: false, msg: "" });
      });

      
    } catch (e) {
      writeLog('booking', 'createBooking', '00008', e.stack)
      return res.status(500).json({ success: false, msg: '' })
    }
  },
  // 00009
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
        .exec();

      return res.status(200).json({ success: true, info: bookings });
    } catch (e) {
      writeLog('booking', 'getAllBookingPerKP', '00009', e.stack)
      return res.status(500).json({
        success: false,
        msg: "Failed to get the list of bookings record.",
      });
    }
  },

  getAllBookingPerKPPerPage: async (req, res) => {
    try {
      let limit = req.params.limit
      let page = (req.params.page - 1) * limit
      let colSize = await Booking.countDocuments({ keyPartnerId: req.params.id, deletedAt: '' }).exec()
      let bookings = await Booking.find({
        deletedAt: "",
        keyPartnerId: req.params.id,
      })
        .populate({
          path: "itemId",
          model: "inventory",
        })
        .sort({ createdAt: -1 })
        .skip(page)
        .limit(limit)
        .exec();

      return res.status(200).json({ success: true, info: bookings, length: colSize });
    } catch (e) {
      writeLog('booking', 'getAllBookingPerKP', '00009', e.stack)
      return res.status(500).json({
        success: false,
        msg: "Failed to get the list of bookings record.",
      });
    }
  },

  getAllBookingPerKPFiltered: async (req, res) => {
    try {
      let search = JSON.parse(req.query.search) || undefined
      let filter = JSON.parse(req.query.filter)
      filter.deletedAt =''
      filter.keyPartnerId = req.params.id
      if(search !== undefined) filter[search.key] = { $regex: new RegExp(search.value, 'gi') }
      if(filter.status === 'all') filter.status = ['fulfilled', 'unfulfilled']
      let limit = req.params.limit
      let page = (req.params.page - 1) * limit
      let colSize = await Booking.countDocuments(filter).exec()
      let bookings = await Booking.find(filter)
        .populate({
          path: "itemId",
          model: "inventory",
        })
        .sort({ createdAt: -1 })
        .skip(page)
        .limit(limit)
        .exec();

      return res.status(200).json({ success: true, info: bookings, length: colSize });
    } catch(e) {
      writeLog('booking', 'getAllBookingFiltered', '0000AXX', e.stack)
      return res.status(500).json({
        success: false,
        msg: "Failed to get the list of bookings record.",
      });
    }
  },

  // 0000A
  getAllBookings: async (req, res) => {
    try {
      console.log(JSON.parse(req.query.filters))
      // let filters = (req.query === undefined) ? { deletedAt: '' } : 
      let query = (req.query === undefined) ? { deletedAt: '' } : { deletedAt: '', [req.query.key]: { $regex: new RegExp(req.query.value, 'gi') } }
      let bookings = await Booking.find(query)
        .populate({
          path: "itemId",
          model: "inventory",
        })
        .exec();

      return res.status(200).json({ success: true, info: bookings });
    } catch (e) {
      writeLog('booking', 'getAllBookings', '0000A', e.stack)
      return res.status(500).json({
        success: false,
        msg: "Failed to get the list of bookings record.",
      });
    }
  },

  getAllBookingsByPage: async (req, res) => {
    try {
      let limit = req.params.limit
      let page = (req.params.page - 1) * limit
      let colSize = await Booking.countDocuments({ deletedAt: '' }).exec()
      let bookings = await Booking.find({
        deletedAt: "",
      })
        .populate({
          path: "itemId",
          model: "inventory",
        })
        .sort({ createdAt: -1 })
        .skip(page)
        .limit(limit)
        .exec();

      return res.status(200).json({ success: true, info: bookings, length: colSize });
    } catch (e) {
      writeLog('booking', 'getAllBookings', '0000A', e.stack)
      return res.status(500).json({
        success: false,
        msg: "Failed to get the list of bookings record.",
      });
    }
  },

  getAllBookingFiltered: async (req, res) => {
    try {
      let search = JSON.parse(req.query.search) || undefined
      let filter = JSON.parse(req.query.filter)
      filter.deletedAt =''
      if(search !== undefined) filter[search.key] = { $regex: new RegExp(search.value, 'gi') }
      if(filter.status === 'all') filter.status = ['fulfilled', 'unfulfilled']
      let limit = req.params.limit
      let page = (req.params.page - 1) * limit
      let colSize = await Booking.countDocuments(filter).exec()
      let bookings = await Booking.find(filter)
        .populate({
          path: "itemId",
          model: "inventory",
        })
        .sort({ createdAt: -1 })
        .skip(page)
        .limit(limit)
        .exec();

      return res.status(200).json({ success: true, info: bookings, length: colSize });
    } catch(e) {
      writeLog('booking', 'getAllBookingFiltered', '0000AXX', e.stack)
      return res.status(500).json({
        success: false,
        msg: "Failed to get the list of bookings record.",
      });
    }
  },

  // 0000B
  getSingleBooking: async (req, res) => {
    try {
      let booking = await Booking.findOne({
        bookingId: req.params.id,
        status: "fulfilled",
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

      return res.status(200).json({ success: true, info: booking });
    } catch (e) {
      writeLog('booking', 'getSingleBooking', '0000B', e.stack)
      return res.status(500).json({
        success: false,
        msg: "Failed to get the booking record.",
      });
    }
  },
  // 0000C
  getMonthlyBooking: async (req, res) => {
    try {
      let response = [];
      for (let i = 0; i < moment().daysInMonth(); i++) {
        response.push(0);
      }
      let bookings = await Booking.find({
        createdAt: { $gte: req.params.start, $lte: req.params.end },
      }).exec();
      for (let i = 0; i < bookings.length; i++) {
        let j = moment(bookings[i].createdAt).format("DD");
        response[parseInt(j) - 1] += 1;
      }
      return res.status(200).json({ succes: true, info: response });
    } catch (e) {
      writeLog('booking', 'getMonthlyBooking', '0000C', e.stack)
      return res.status(500).json({ success: false, msg: "" });
    }
  },
  // 0000D
  getMonthlyBookingByKeyPartner: async (req, res) => {
    try {
      let response = [];
      for (let i = 0; i < moment().daysInMonth(); i++) {
        response.push(0);
      }
      let bookings = await Booking.find({
        keyPartnerId: req.params.id,
        createdAt: { $gte: req.params.start, $lte: req.params.end },
      }).exec();
      for (let i = 0; i < bookings.length; i++) {
        let j = moment(bookings[i].createdAt).format("DD");
        response[parseInt(j) - 1] += 1;
      }
      return res.status(200).json({ succes: true, info: response });
    } catch (e) {
      writeLog('booking', 'getMonthlyBookingByKeyPartner', '0000D', e.stack)
      return res.status(500).json({ success: false, msg: "" });
    }
  },

  /**
   * Mark booking as fulfilled
   * 0000E
   */
  markSelectedAsFulfilled: async (req, res) => {
    try {
      let bookings = await Booking.find({ _id: req.body.ids }).exec();
      bookings.forEach(booking => {
        booking.status = "fulfilled";
        booking.markModified("status");
        booking.save();
      });
      return res.status(200).json({ success: true, info: "" });
    } catch (e) {
      writeLog('booking', 'markSelectedAsFulfilled', '0000E', e.stack)
      return res.status(500).json({ success: false, msg: "" });
    }
  },

  /**
   * Mark one as fulfilled
   * 0000F
   */
  markOneAsFulfilled: async (req, res) => {
    try {
      await Booking.findByIdAndUpdate(req.params.id, {
        $set: { status: "fulfilled" },
      }).exec();
      return res.status(200).json({ success: true, info: "" });
    } catch (e) {
      writeLog('booking', 'markOneAsFulfilled', '0000F', e.stack)
      return res.status(500).json({ success: false, msg: "" });
    }
  },

  /**
   * 00010
   * Mark one as unfulfilled
   */
  markOneAsUnfulfilled: async (req, res) => {
    try {
      await Booking.findByIdAndUpdate(req.params.id, {
        $set: { status: "unfulfilled" },
      }).exec();
      return res.status(200).json({ success: true, info: "" });
    } catch (e) {
      writeLog('booking', 'markOneAsUnFulfilled', '00010', e.stack)
      return res.status(500).json({ success: false, msg: "" });
    }
  },
  /**
   * Mark one as unfulfilled
   * 00011
   */
  exportOne: async (req, res) => {
    try {
      let token = jwt.decode(req.headers.authorization.split(" ")[1]);
      let booking = await Booking.find({ _id: req.params.id }).populate({ path: "itemId", populate: { path: "classification size color" } })
        // .populate("bundleId")
        
      let file =
        booking[0].courier === "flash"
          ? await generateFlash(booking, token.sub)
          : await generateJnt(booking, token.sub);
      return res.status(200).json({ success: true, info: file });
    } catch (e) {
      writeLog('booking', 'exportOne', '00011', e.stack)
      return res.status(500).json({ success: false, msg: "" });
    }
  },
  /**
   * Booking Return
   * 00012
   */
  returnBooking: async (req, res) => {
    try {
      req.body.items.map(async item => {
        let it = await Inventory.findById(item.itemId).exec();
        it.defective = +it.defective + +item.defective
        it.currentQty = +it.currentQty + +item.good
        it.out = +it.out - +item.quantity
        it.save()
      });
      await Booking.findByIdAndUpdate(req.params.id, {
        remarks: req.body.remarks,
      }).then(booking => {
        return res.status(200).json({ success: true, info: booking });
      });
    } catch (error) {
      writeLog('booking', 'returnBooking', '00012', error.stack)
      return res.status(500).json({
        success: false,
        msg: "Failed to return booking please try again.",
      });
    }
  },

  /**
   *00013
   */
  uploadBooking: async (req, res) => {
    try {
      let bookingFile = fs.readFileSync(
        `./uploads/booking/${req.body.filename}`,
        "utf-8"
      );
      let bookingData = bookingFile.trim().split("\r\n");
      let returnBooking = [];
      let checkBookingAddr = []
      bookingData.splice(0, 1);
      
      // console.log(checkAddr('RIZAL', 'CAINTA', 'SAN JUAN', 'flash'))

      for(let booking of bookingData) {
        let b = booking.split(',')
        checkBookingAddr.push(checkAddr(b[2].toUpperCase(), b[3].toUpperCase(), b[4].toUpperCase(), b[7]))
      }

      if(checkBookingAddr.indexOf('NO') === -1 && checkBookingAddr.indexOf('error') === -1) {
        for (let i = 0; i < bookingData.length; i++) {
          if (bookingData[i] !== "") {
            let data = bookingData[i].split(","),
              itemId = {};
            let booking = await Booking.find({
              keyPartnerId: req.body.id,
            }).exec();
            let user = await User.findById(req.body.id).exec();
            let genId = generateId(booking, user.userId);
            if (data[14] === "individual") {
              let inv = await Inventory.find({ keyPartnerId: req.body.id })
                .populate({
                  path: "classification code color size",
                  model: "classification",
                })
                .exec();
              for (let j = 0; j < inv.length; j++) {
                let sku = `SKU-EC-${inv[j].classification.code}-${inv[j].color.code}-${inv[j].size.code}-${inv[j].sequence}`;
                if (data[12] === sku) {
                  itemId.id = inv[j]._id;
                  break;
                }
              }
            } else if (data[14] === "bundle") {
              let bnd = await Bundle.findOne({
                keyPartnerId: req.body.id,
                name: data[12],
              }).populate('items').exec();
              itemId.id = bnd._id
              itemId.items = {
                name: bnd.name,
                quantity: '',
                items: bnd.items
              }
            }
            let newBooking = await new Booking({
              keyPartnerId: req.body.id,
              bookingId: genId,
              customer: data[0],
              customerContact: data[1],
              province: data[2],
              city: data[3],
              brgy: data[4],
              hsStNum: data[5],
              zip: data[6],
              courier: data[7],
              cod: data[8],
              sender: data[9],
              senderContact: data[10],
              remarks: data[11],
              itemId: itemId.id,
              bundleId: (data[14] === 'individual') ? null : itemId.items,
              quantity: data[13],
              itemType: data[14],
              status: "unfulfilled",
              deletedAt: ""
            }).save();
            if (newBooking.itemType === "individual") {
              let inv = await Inventory.findById(newBooking.itemId).exec();
              inv.currentQty = +inv.currentQty - +newBooking.quantity;
              inv.out = +inv.out + +newBooking.quantity;
              inv.save();
              if (+inv.currentQty <= +inv.criticalBalance) {
                let admins = await User.find({ accessLvl: [1, 2] }).exec();
                admins.forEach(async admin => {
                  await NotificationCount.findOneAndUpdate(
                    { userId: admin._id },
                    { $inc: { adminInv: 1 } }
                  ).exec();
                  global.io.emit("admin inventory warning", {
                    id: admin._id,
                    info: 1,
                  });
                });
                await NotificationCount.findOneAndUpdate(
                  { userId: req.body.id },
                  { $inc: { kpInv: 1 } }
                ).exec();
                global.io.emit("keypartner inventory warning", {
                  id: req.body.id,
                  info: 1,
                });
              }
            } else if (newBooking.itemType === "bundle") {
              let bnd = await Bundle.findById(newBooking.itemId).exec();
              bnd.items.map(async item => {
                let i = await Inventory.findById(item.itemId).exec();
                i.out = +i.out + +item.quantity;
                i.currentQty = +i.currentQty - +item.quantity
                i.save();
                if (+i.currentQty <= +i.criticalBalance) {
                  let admins = await User.find({ accessLvl: [1, 2] }).exec();
                  admins.forEach(async admin => {
                    await NotificationCount.findOneAndUpdate(
                      { userId: admin._id },
                      { $inc: { adminInv: 1 } }
                    ).exec();
                    global.io.emit("admin inventory warning", {
                      id: admin._id,
                      info: 1,
                    });
                  });
                  await NotificationCount.findOneAndUpdate(
                    { userId: req.body.keyPartnerId },
                    { $inc: { kpInv: 1 } }
                  ).exec();
                  global.io.emit("keypartner inventory warning", {
                    id: req.body.keyPartnerId,
                    info: 1,
                  });
                }
              });
            }
            let responseBooking = await Booking.findById(newBooking._id)
              .populate("itemId")
              .exec();
            returnBooking.push(responseBooking);
          }
        }
        new File({ filePath: `/uploads/booking/${req.body.filename}` }).save();
        return res.status(200).json({ success: true, info: returnBooking });
      } else {
        return res.status(406).json({ success: false, msg: 'Unable to save booking. Please check addresses if not ODZ (Out of Delivery Zone) to the selected courier.' });
      }
    } catch (e) {
      writeLog('booking', 'uploadBooking', '00013', e.stack)
      return res.status(500).json({ success: false, msg: "" });
    }
  },

  /**
   *00014
   */
  deleteBooking: (req, res) => {
    // try {
    //   await Booking.findByIdAndDelete(req.params.id).exec()
    //   return res.sendStatus(204)
    // } catch(e) {
    //   return res.status(500).json({ success: false, msg: 'Failed to delete booking' })
    // }
    Booking.findByIdAndUpdate(req.params.id, { $set: { deletedAt: moment() } })
      .then(async booking => {
        if (booking.itemType === "individual") {
          let inv = await Inventory.findById(booking.itemId).exec();
          inv.currentQty = +inv.currentQty + +booking.quantity;
          inv.out = +inv.out - +booking.quantity;
          inv.markModified("currentQty");
          inv.markModified("out");
          inv.save();
          if (+inv.currentQty <= +inv.criticalBalance) {
            let admins = await User.find({ accessLvl: [1, 2] }).exec();
            admins.forEach(async admin => {
              await NotificationCount.findOneAndUpdate(
                { userId: admin._id },
                { $inc: { adminInv: 1 } }
              ).exec();
              global.io.emit("admin inventory warning", {
                id: admin._id,
                info: 1,
              });
            });
            await NotificationCount.findOneAndUpdate(
              { userId: req.body.keyPartnerId },
              { $inc: { kpInv: 1 } }
            ).exec();
            global.io.emit("keypartner inventory warning", {
              id: req.body.keyPartnerId,
              info: 1,
            });
          }
          return res.sendStatus(204);
        } else if (booking.itemType === "bundle") {
          Bundle.findById(booking.itemId)
            .then(bundle => {
              bundle.items.map(async item => {
                let inv = await Inventory.findById(item.itemId).exec();
                inv.currentQty = +inv.currentQty + +item.quantity;
                inv.out = +inv.out - +item.quantity;
                inv.markModified("currentQty");
                inv.markModified("out");
                inv.save();
                if (+inv.currentQty <= +inv.criticalBalance) {
                  let admins = await User.find({ accessLvl: [1, 2] }).exec();
                  admins.forEach(async admin => {
                    await NotificationCount.findOneAndUpdate(
                      { userId: admin._id },
                      { $inc: { adminInv: 1 } }
                    ).exec();
                    global.io.emit("admin inventory warning", {
                      id: admin._id,
                      info: 1,
                    });
                  });
                  await NotificationCount.findOneAndUpdate(
                    { userId: req.body.keyPartnerId },
                    { $inc: { kpInv: 1 } }
                  ).exec();
                  global.io.emit("keypartner inventory warning", {
                    id: req.body.keyPartnerId,
                    info: 1,
                  });
                }
              });
              return res.sendStatus(204);
            })
            .catch(e => {
              console.log("Bundle: ", e);
              return res
                .status(500)
                .json({ success: false, msg: "Failed to update inventory" });
            });
        }
      })
      .catch(e => {
        writeLog('booking', 'deleteBooking', '00014', e.stack)
        return res
          .status(500)
          .json({ success: false, msg: "Failed to delete booking" });
      });
  },
};
