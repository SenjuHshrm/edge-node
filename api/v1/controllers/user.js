const User = require("../../../models/User");
const sendCred = require("../../../utils/mailer").sendPassword;
const NotificationCount = require('../../../models/NotificationCount')

module.exports = {
  /**
   *
   * User registration for key partners
   *
   */
  register: (req, res) => {
    let user = new User({
      email: req.body.email,
      username: req.body.accessLvl === 3 ? req.body.email : req.body.username,
      password: "",
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
        if(record.accessLvl === 3) {
          new NotificationCount({
            userId: user._doc._id,
            contract: { count: 0, isOpened: true },
            quotation: { count: 0, isOpened: true }
          }).save()
        } else if(record.accessLvl === 1 || record.accessLvl === 2) {
          new NotificationCount({
            userId: user._doc._id,
            purchaseOrder: { count: 0, isOpened: true },
            acctReq: { count: 0, isOpened: true }
          }).save()
        }
        let admins = await User.find({ accessLvl: [1, 2] }).exec()
        admins.forEach(async admin => {
          await NotificationCount.findOneAndUpdate({ userId: admin._id }, { $inc: { 'acctReq.count': 1 }}).exec()
          global.io.emit('new account request', { info: 1 })
        })
        return res.status(200).json({ msg: "Account registered successfully" });
      })
      .catch(err => {
        console.log(err);
        return res.status(500).json({ msg: "An error occured" });
      });
  },

  /**
   *
   */
  getAccountsForApproval: async (req, res) => {
    try {
      let users = await User.find(
        { accessLvl: 3, isApproved: "pending" },
        { password: 0, refreshToken: 0, isActivated: 0, isApproved: 0 }
      ).exec();
      return res.status(200).json({ success: true, info: users });
    } catch (e) {
      return res.status(500).json({ success: false, msg: "" });
    }
  },

  /**
   *
   */
  getApprovedKeyPartners: async (req, res) => {
    try {
      let kp = await User.find(
        { accessLvl: 3, isApproved: "true" },
        { password: 0, refreshToken: 0, isApproved: 0 }
      ).exec();
      return res.status(200).json({ success: true, info: kp });
    } catch (e) {
      return res.status(500).json({ success: false, msg: "" });
    }
  },

  /**
   *
   */
  getOneKeyPartners: async (req, res) => {
    try {
      let kp = await User.findById(req.params.id).exec();
      return res.status(200).json({ success: true, info: kp });
    } catch (e) {
      return res.status(500).json({ success: false, msg: "" });
    }
  },

  /**
   *
   */
  getActiveKeyPartners: async (req, res) => {
    try {
      let kp = await User.find(
        { accessLvl: 3, isActivated: true },
        { _id: 1, company: 1, email: 1 }
      ).exec();
      return res.status(200).json({ success: true, info: kp });
    } catch (e) {
      return res.status(500).json({ success: false, msg: "" });
    }
  },

  /**
   * Get user information by user id
   */
  profile: async (req, res) => {
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
  },

  /**
   * Approve key partner account request
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
      return res.status(500).json({ success: false, msg: "" });
    }
  },

  /**
   *
   */
  setActiveStatus: async (req, res) => {
    try {
      await User.findByIdAndUpdate(req.params.id, {
        $set: { isActivated: req.body.status },
      }).exec();
      let msg = req.body.status ? "Account activated" : "Account deactivated";
      return res.status(200).json({ success: true, msg: msg });
    } catch (e) {
      return res.status(500).json({ success: false, msg: "" });
    }
  },

  /**
   *
   */
  setKeyPartnerPassword: async (req, res) => {
    try {
      let user = await User.findById(req.params.id).exec();
      user.savePassword(req.body.password);
      user.markModified("password");
      user
        .save()
        .then(rec => {
          sendCred(rec.email, req.body.password);
          return res.status(200).json({
            success: true,
            msg: "Password set successfully. Credentials are now sent to the key partner's email address.",
          });
        })
        .catch(e => {
          return res.status(500).json({ success: false, msg: "" });
        });
    } catch (e) {
      return res.status(500).json({ success: false, msg: "" });
    }
  },

  /**
   *
   */
  setKeyPartnerCode: async (req, res) => {
    try {
      await User.findByIdAndUpdate(req.params.id, {
        $set: { userId: req.body.userId },
      }).exec();
      return res.sendStatus(204);
    } catch (e) {
      return res.status(500).json({ success: false, msg: "" });
    }
  },

  assignCodeAndPassword: async (req, res) => {
    try {
      await User.findByIdAndUpdate(req.params.id, {
        $set: { userId: req.body.userId },
      }).exec();

      let user = await User.findById(req.params.id).exec();
      user.savePassword(req.body.password);
      user.markModified("password");
      user
        .save()
        .then(async rec => {
          sendCred(rec.email, req.body.password);
          return res.status(200).json({
            success: true,
            msg: "Password and Code set successfully. Credentials are now sent to the key partner's email address.",
            info: rec,
          });
        })
        .catch(e => {
          return res.status(500).json({ success: false, msg: "" });
        });
    } catch (error) {
      return res.status(500).json({ success: false, msg: "" });
    }
  },

  /**
   * Reject key partner account request
   */
  rejectAcctReq: async (req, res) => {},

  /**
   * Activate registered key partner's account
   */
  activateUser: async (req, res) => {},

  /**
   * Update profile
   */
  updateProfile: async (req, res) => {
    try {
      let profile = await User.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
      }).exec();
      return res.status(200).json({ success: true, info: profile });
    } catch (e) {
      return res.status(500).json({
        success: false,
        msg: "Failed to update the selected customer.",
      });
    }
  },

  /* Update Profile Image */
  updateProfileImage: async (req, res) => {
    try {
      const { filename, keyPartnerId } = req.body;
      const path = `/profile/${filename}`;
      let user = await User.findByIdAndUpdate(
        keyPartnerId,
        { img: path },
        { new: true }
      ).exec();
      res.status(200).json({ success: true, info: user.img });
    } catch (error) {
      return res.status(500).json({
        success: false,
        msg: "Failed to update the profile image.",
      });
    }
  },

  /**
   * Get Keypartners
   */
  getKeyPartners: async (req, res) => {
    try {
      let keyPartners = await User.find({
        deletedAt: "",
        accessLvl: 3,
      }).exec();
      return res.status(200).json({ success: true, info: keyPartners });
    } catch (e) {
      return res.status(500).json({
        success: false,
        msg: "Failed to get the list of key partners.",
      });
    }
  },

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
            console.log(e);
            return res.status(500).json({ success: false, msg: "" });
          });
      } else {
        return res.status(200).json({
          success: false,
          msg: "Please enter the right current password.",
        });
      }
    } catch (error) {
      console.log(error);
      return res.status(500).json({
        success: false,
        msg: "Failed to change your password.",
      });
    }
  },

  /**
   * Get Notification counters
   */
  getNotificationCounts: async (req, res) => {
    try {
      let notifCounts = await NotificationCount.findOne({ user: req.params.id }).exec()
      return res.status(200).json({ success: true, info: notifCounts })
    } catch(e) {
      console.log(e)
      return res.status(500).json({ success: false, msg: '' })
    }
  },

  /**
   * Update isOpened property of counters
   */
  updateNotifOpenStatus: async (req, res) => {
    try {
      await NotificationCount.findOneAndUpdate({ userId: req.params.id }, { $set: { [`${req.body.field}.isOpened`]: true, [`${req.body.field}.count`]: 0 } }).exec()
      return res.status(200).json({ success: true, msg: 'ok' })
    } catch(e) {
      console.log(e)
      return res.status(500).json({ success: false, msg: '' })
    }
  }
};
