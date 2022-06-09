const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const crypto = require('crypto')
const { nameBuilder, addrBuilder } = require('../services')

let addrSchema = new mongoose.Schema({
  province: { type: String, required: true },
  city: { type: String, required: true },
  brgy: { type: String, required: true },
  st: String
})

let userSchema = new mongoose.Schema({
  email: { type: String, unique: true, required: true },
  username: { type: String, unique: true, required: true },
  password: { type: String, unique: true, required: true },
  img: { type: String, required: true },
  firstName: { type: String, required: true },
  middleName: String,
  lastName: { type: String, required: true },
  extName: String,
  gender: String,
  birthday: { type: String, required: true },
  contact: { type: String, required: true },
  addr: addrSchema
}, { timestamps: true })

userSchema.methods.savePassword = function(pw) {
  this.password = bcrypt.hashSync(pw, 10)
}

userSchema.methods.comparePasswords = function(pw) {
  return bcrypt.compareSync(pw, this.password)
}

userSchema.methods.generateToken = function() {
  return {
    access: jwt.sign({ sub: this._id, name: nameBuilder(this) }, process.env.JWT_SECRET, { algorithm: 'RS256', expiresIn: '15m' }),
    refresh: jwt.sign({ sub: this._id }, process.env.JWT_SECRET, { algorithm: 'RS256', expiresIn: '1y' })
  }
}

userSchema.methods.setImg = function(img, username) {
  if(img === '') {
    let md5 = crypto.createHash('md5').update(username).digest('hex')
    this.img = `https://gravatar.com/avatar/${md5}?d=retro`
  } else {
    this.img = img
  }
}

userSchema.methods.userProfile = function() {
  return {
    username: this.username,
    name: nameBuilder(this),
    gender: this.gender,
    bday: this.bday,
    addr: addrBuilder(this.addr),
    contact: this.contact
  }
}

const User = mongoose.model('user', userSchema)

module.exports = User