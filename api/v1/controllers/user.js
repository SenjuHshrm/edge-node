const User = require("../../../models/User");
const sendCred = require("../../../utils/mailer").sendPassword;
const NotificationCount = require("../../../models/NotificationCount");
const { sendRejectAcct } = require('../../../utils/mailer')
const jwt = require('jsonwebtoken')
const writeLog = require('../../../utils/write-log')

module.exports = {
  /**
   *
   * User registration for key partners
   * 0004A
   */
  register: (req, res) => {
    let user = new User({
      email: req.body.email,
      username: req.body.accessLvl === 3 ? req.body.email : req.body.username,
      password: "",
      secondPassword: "",
      name: req.body.name,
      contact: req.body.contact,
      company: req.body.company,
      addr: req.body.addr,
      accessLvl: req.body.accessLvl,
      isApproved: req.body.accessLvl === 3 ? "pending" : "true",
      isActivated: req.body.accessLvl === 3 ? false : true,
    });
    if (req.body.accessLvl !== 3) {
      user.savePassword(req.body.password);
    }
    user.setImg(req.body.img, req.body.email);
    user
      .save()
      .then(async record => {
        if (record.accessLvl === 3) {
          new NotificationCount({
            userId: user._doc._id,
            coanda: 0,
            soa: 0,
            quotation: 0,
            kpInv: 0,
          }).save();
        } else if (record.accessLvl === 1 || record.accessLvl === 2) {
          new NotificationCount({
            userId: user._doc._id,
            inquiry: 0,
            purchaseOrder: 0,
            acctReq: 0,
            adminInv: 0,
          }).save();
        }
        if (req.body.accessLvl === 3) {
          let admins = await User.find({ accessLvl: [1, 2] }).exec();
          admins.forEach(async admin => {
            await NotificationCount.findOneAndUpdate(
              { userId: admin._id },
              { $inc: { acctReq: 1 } }
            ).exec();
            global.io.emit("new account request", { id: admin._id, info: 1 });
          });
        }
        return res.status(200).json({ msg: "Account registered successfully" });
      })
      .catch(err => {
        writeLog('user', 'register', '0004A', e.stack)
        return res.status(500).json({ msg: "An error occured" });
      });
  },

  /**
   * 0004B
   */
  getAccountsForApproval: async (req, res) => {
    try {
      let users = await User.find(
        { accessLvl: 3, isApproved: "pending" },
        { password: 0, refreshToken: 0, isActivated: 0, isApproved: 0 }
      ).exec();
      return res.status(200).json({ success: true, info: users });
    } catch (e) {
      writeLog('user', 'getAccountsForApproval', '0004B', e.stack)
      return res.status(500).json({ success: false, msg: "" });
    }
  },

  /**
   * 0004C
   */
  getApprovedKeyPartners: async (req, res) => {
    try {
      let kp = await User.find(
        { accessLvl: 3, isApproved: "true", deletedAt: null },
        { password: 0, refreshToken: 0, isApproved: 0 }
      ).exec();
      return res.status(200).json({ success: true, info: kp });
    } catch (e) {
      writeLog('user', 'getApprovedKeyPartners', '0004C', e.stack)
      return res.status(500).json({ success: false, msg: "" });
    }
  },

  /**
   * 0004D
   */
  getOneKeyPartners: async (req, res) => {
    try {
      let kp = await User.findById(req.params.id).exec();
      return res.status(200).json({ success: true, info: kp });
    } catch (e) {
      writeLog('user', 'getOneKeyPartners', '0004D', e.stack)
      return res.status(500).json({ success: false, msg: "" });
    }
  },

  /**
   * 0004E
   */
  getActiveKeyPartners: async (req, res) => {
    try {
      let kp = await User.find(
        { accessLvl: 3, isActivated: true },
        { _id: 1, company: 1, email: 1 }
      ).exec();
      return res.status(200).json({ success: true, info: kp });
    } catch (e) {
      writeLog('user', 'getActiveKeyPartners', '0004E', e.stack)
      return res.status(500).json({ success: false, msg: "" });
    }
  },

  /**
   * Get user information by user id
   * 0004F
   */
  profile: async (req, res) => {
    try {
      let user = await User.findById(req.params.id).exec();
      if (!user) {
        return res.status(404).json({ msg: "User not found." });
      }
      return res.status(200).json({
        success: true,
        msg: "success",
        data: user.userProfile(),
        info: res.locals.token,
      });
    } catch(e) {
      writeLog('user', 'profile', '0004F', e.stack)
      return res.status(500).json({ msg: 'Failed to get profile' })
    }
  },

  /**
   * Approve key partner account request
   * 00050
   */
  approveAcctReq: async (req, res) => {
    try {
      await User.findByIdAndUpdate(req.params.id, {
        $set: { isApproved: "true" },
      }).exec();
      return res
        .status(200)
        .json({ success: true, msg: "Key Partner approved." });
    } catch (e) {
      writeLog('user', 'approveAccReq', '00050', e.stack)
      return res.status(500).json({ success: false, msg: "" });
    }
  },

  /**
   * 00051
   */
  setActiveStatus: async (req, res) => {
    try {
      await User.findByIdAndUpdate(req.params.id, {
        $set: { isActivated: req.body.status },
      }).exec();
      let msg = req.body.status ? "Account activated" : "Account deactivated";
      return res.status(200).json({ success: true, msg: msg });
    } catch (e) {
      writeLog('user', 'setActiveStatus', '00051', e.stack)
      return res.status(500).json({ success: false, msg: "" });
    }
  },

  /**
   * 00052, 00053
   */
  setKeyPartnerPassword: async (req, res) => {
    try {
      let user = await User.findById(req.params.id).exec();
      user.savePassword(req.body.password);
      user.saveSecondPassword(req.body.secondPassword);
      user
        .save()
        .then(rec => {
          sendCred(rec.email, req.body.password, req.body.secondPassword);
          return res.status(200).json({
            success: true,
            msg: "Password set successfully. Credentials are now sent to the key partner's email address.",
          });
        })
        .catch(e => {
          writeLog('user', 'setKeyPartnerPassword', '00053', e.stack)
          return res.status(500).json({ success: false, msg: "" });
        });
    } catch (e) {
      writeLog('user', 'setKeyPartnerPassword', '00052', e.stack)
      return res.status(500).json({ success: false, msg: "" });
    }
  },

  /**
   * 00054
   */
  setKeyPartnerCode: async (req, res) => {
    try {
      await User.findByIdAndUpdate(req.params.id, {
        $set: { userId: req.body.userId },
      }).exec();
      return res.sendStatus(204);
    } catch (e) {
      writeLog('user', 'setKeyPartnerCode', '00054', e.stack)
      return res.status(500).json({ success: false, msg: "" });
    }
  },

  /**
   * 00055, 00056
   */
  assignCodeAndPassword: async (req, res) => {
    try {
      await User.findByIdAndUpdate(req.params.id, {
        $set: { userId: req.body.userId },
      }).exec();

      let user = await User.findById(req.params.id).exec();
      user.savePassword(req.body.password);
      user.saveSecondPassword(req.body.secondPassword);
      // user.markModified("password")
      // user.markModified("secondPassword")
      user
        .save()
        .then(async rec => {
          sendCred(rec.email, req.body.password, req.body.secondPassword);
          return res.status(200).json({
            success: true,
            msg: "Password and Code set successfully. Credentials are now sent to the key partner's email address.",
            info: rec,
          });
        })
        .catch(e => {
          writeLog('user', 'assignCodeAndPassword', '00056', e.stack)
          return res.status(500).json({ success: false, msg: "" });
        });
    } catch (error) {
      writeLog('user', 'assignCodeAndPassword', '00055', e.stack)
      return res.status(500).json({ success: false, msg: "" });
    }
  },

  /**
   * Reject key partner account request
   * 00057
   */
  rejectAcctReq: async (req, res) => {
    try {
      await User.findByIdAndDelete(req.params.id).exec()
      sendRejectAcct(req.params.email)
      return res.status(200).json({ success: true, info: req.params.id })
    } catch(e) {
      writeLog('user', 'rejectAcctReq', '00057', e.stack)
      return res.status(500).json({ success: false, msg: '' })
    }
  },

  /**
   * Update profile
   * 00058
   */
  updateProfile: async (req, res) => {
    try {
      let profile = await User.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
      }).exec();
      return res.status(200).json({ success: true, info: profile });
    } catch (e) {
      writeLog('user', 'updateProfile', '00058', e.stack)
      return res.status(500).json({
        success: false,
        msg: "Failed to update the selected customer.",
      });
    }
  },

  /**
   * 00059
   */
  updateUsername: async (req, res) => {
    try {
      await User.findByIdAndUpdate(
        req.params.id,
        { $set: { username: req.body.username } },
        { runValidators: true, context: "query" }
      ).exec();
      return res.status(200).json({ success: true, msg: "Username updated" });
    } catch (e) {
      writeLog('user', 'updateUsername', '00059', e.stack)
      return res
        .status(500)
        .json({ success: false, msg: e.errors.username.message });
    }
  },

  /**
   * Update Profile Image
   * 0005A
   */
  updateProfileImage: async (req, res) => {
    try {
      const { filename, keyPartnerId } = req.body;
      const path = `/profile/${filename}`;
      let user = await User.findByIdAndUpdate(
        keyPartnerId,
        { img: path },
        { new: true }
      ).exec();
      let oldToken = jwt.decode(req.headers.authorization.split(' ')[1])
      let newToken = user.generateToken()
      await User.findByIdAndUpdate(keyPartnerId, { $push: { refreshToken: { uid: newToken.uid, token: newToken.refresh } } }).exec()
      await User.findByIdAndUpdate(keyPartnerId, { $pull: { refreshToken: { uid: oldToken.uid } } }).exec()
      res.status(200).json({ success: true, info: newToken.access });
    } catch (e) {
      writeLog('user', 'updateProfileImage', '0005A', e.stack)
      return res.status(500).json({
        success: false,
        msg: "Failed to update the profile image.",
      });
    }
  },

  /**
   * Get Keypartners
   * 0005B
   */
  getKeyPartners: async (req, res) => {
    try {
      let keyPartners = await User.find({
        deletedAt: null,
        accessLvl: 3,
      }).exec();
      return res.status(200).json({ success: true, info: keyPartners });
    } catch (e) {
      writeLog('user', 'getKeyPartners', '0005B', e.stack)
      return res.status(500).json({
        success: false,
        msg: "Failed to get the list of key partners.",
      });
    }
  },

  /**
   * Change password
   * 0005C, 0005D
   */
  changePassword: async (req, res) => {
    try {
      let user = await User.findById(req.body.id).exec();
      if (user && (await user.comparePasswords(req.body.oldPass))) {
        user.savePassword(req.body.newPass);
        user.markModified("password");
        user
          .save()
          .then(rec => {
            return res.status(200).json({
              success: true,
              msg: "Password has been changed successfully",
            });
          })
          .catch(e => {
            writeLog('user', 'changePassword', '0005D', e.stack)
            return res.status(500).json({ success: false, msg: "" });
          });
      } else {
        return res.status(200).json({
          success: false,
          msg: "Please enter the right current password.",
        });
      }
    } catch (e) {
      writeLog('user', 'changePassword', '0005C', e.stack)
      return res.status(500).json({
        success: false,
        msg: "Failed to change your password.",
      });
    }
  },

  /**
   * Change password for secure internal pages
   * 0005E, 0005F
   */
  changeIPAPassword: async (req, res) => {
    try {
      let user = await User.findById(req.body.id).exec();
      if (user && (await user.compareSecondPassword(req.body.oldPass))) {
        user.saveSecondPassword(req.body.newPass);
        user.markModified("password");
        user
          .save()
          .then(rec => {
            return res.status(200).json({
              success: true,
              msg: "Password has been changed successfully",
            });
          })
          .catch(e => {
            writeLog('user', 'changeIPAPassword', '0005F', e.stack)
            return res.status(500).json({ success: false, msg: "" });
          });
      } else {
        return res.status(200).json({
          success: false,
          msg: "Please enter the right current password.",
        });
      }
    } catch (e) {
      writeLog('user', 'changeIPAPassword', '0005E', e.stack)
      return res.status(500).json({
        success: false,
        msg: "Failed to change your password.",
      });
    }
  },

  /**
   * Get Notification counters
   * 00060
   */
  getNotificationCounts: async (req, res) => {
    try {
      let notifCounts = await NotificationCount.findOne({
        userId: req.params.id,
      }).exec();
      return res.status(200).json({ success: true, info: notifCounts });
    } catch (e) {
      writeLog('user', 'getNotificationCounts', '00060', e.stack)
      return res.status(500).json({ success: false, msg: "" });
    }
  },

  /**
   * Toggle opened pages with notifications
   * 00061
   */
  updateNotifOpenStatus: async (req, res) => {
    try {
      await NotificationCount.findOneAndUpdate(
        { userId: req.params.id },
        { $set: { [`${req.body.field}`]: 0 } }
      ).exec();
      return res.status(200).json({ success: true, msg: "ok" });
    } catch (e) {
      writeLog('user', 'updateNotifOpenStatus', '00061', e.stack)
      return res.status(500).json({ success: false, msg: "" });
    }
  },

  /**
   * Delete Key Partners
   * 00062
   */
  deleteKeyPartners: async (req, res) => {
    try {
      await User.findByIdAndUpdate(req.params.id, {
        deletedAt: new Date().toLocaleString(),
        isActivated: false,
      });
      return res
        .status(200)
        .json({ success: true, msg: "ok", info: req.params.id });
    } catch (e) {
      writeLog('user', 'deleteKeyPartners', '00062', e.stack)
      return res.status(500).json({
        success: false,
        msg: "Failed to delete the key partner.",
      });
    }
  },
};
