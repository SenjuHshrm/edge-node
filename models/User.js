const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const { nameBuilder, addrBuilder } = require("../api/v1/services");
const { v4: uuidv4 } = require("uuid");
const uniqueValidator = require("mongoose-unique-validator");

let rftSchema = new mongoose.Schema({
  uid: String,
  token: String,
});

let userSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, unique: true },
    username: { type: String, required: true, unique: true },
    userId: { type: String, default: "" },
    password: String,
    secondPassword: String,
    img: { type: String },
    name: { type: String, required: true },
    contact: { type: String, required: true },
    company: { type: String, required: true },
    addr: { type: String },
    refreshToken: [rftSchema],
    accessLvl: { type: Number, required: true },
    isApproved: { type: String, default: "pending" },
    isActivated: { type: Boolean, required: true },
    deletedAt: { type: String },
  },
  { timestamps: true }
);

userSchema.methods.savePassword = function (pw) {
  this.password = bcrypt.hashSync(pw, 10);
};

userSchema.methods.saveSecondPassword = function (pw) {
  this.secondPassword = bcrypt.hashSync(pw, 10);
};

userSchema.methods.comparePasswords = function (pw) {
  return bcrypt.compareSync(pw, this.password);
};

userSchema.methods.generateToken = function () {
  let uid = uuidv4();
  return {
    uid: uid,
    access: jwt.sign(
      {
        sub: this._id,
        name: this.name,
        img: this.img,
        access: this.accessLvl,
        uid: uid,
      },
      process.env.JWT_SECRET,
      { algorithm: "HS256", expiresIn: "15m" }
    ),
    refresh: jwt.sign({ sub: this._id }, process.env.JWT_SECRET, {
      algorithm: "HS256",
      expiresIn: "1y",
    }),
  };
};

userSchema.methods.setImg = function (img, username) {
  if (img === "") {
    let md5 = crypto.createHash("md5").update(username).digest("hex");
    this.img = `https://gravatar.com/avatar/${md5}?d=retro`;
  } else {
    this.img = img;
  }
};

userSchema.methods.userProfile = function () {
  return {
    username: this.username,
    name: nameBuilder(this),
    gender: this.gender,
    bday: this.bday,
    addr: this.addr,
    contact: this.contact,
  };
};

userSchema.plugin(uniqueValidator, { message: "Username already registered" });

const User = mongoose.model("user", userSchema);

module.exports = User;
