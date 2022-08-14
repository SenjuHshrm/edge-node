const User = require("../../../models/User");
const passport = require("passport");
const jwt = require("jsonwebtoken");

module.exports = {
  /**
   *
   * User registration for key partners
   *
   */
  register: (req, res) => {
    let user = new User({
      email: req.body.email,
      username: "",
      name: req.body.name,
      contact: req.body.contact,
      company: req.body.company,
      accessLvl: req.body.accessLvl,
      isActivated: false,
    });
    user.savePassword(req.body.password);
    user.setImg(req.body.img, req.body.email);
    user
      .save()
      .then(record => {
        return res.status(200).json({ msg: "Account registered successfully" });
      })
      .catch(err => {
        console.log(err);
        return res.status(500).json({ msg: "An error occured" });
      });
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
  approveAcctReq: async (req, res) => {},

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
  updateProfile: async (req, res) => {},

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
};
