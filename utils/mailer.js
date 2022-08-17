const nodemailer = require('nodemailer')
const handlebars = require('handlebars')
const fs = require('fs')

exports.sendPassword = (user) => {
  let readFile = (path, cb) => {
    fs.readFile(path, { encoding: 'utf-8' }, (err, html) => {
      if(err) {
        throw err
        cb(err)
      } else {
        cb(null, html)
      }
    })
  }
  const transporter = nodemailer.createTransport({
    port: process.env.EMAIL_PORT,
    host: process.env.EMAIL_HOST,
    secure: false
  })
}