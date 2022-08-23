const nodemailer = require('nodemailer')
const handlebars = require('handlebars')
const fs = require('fs')

exports.sendPassword = (email, password) => {
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
    secure: false,
    auth: {
      user: process.env.SU_EMAIL,
      pass: process.env.SU_PASSWORD
    },
    tls: {
      rejectUnauthorized: false
    }
  })
  readFile('./view/keypartner-password.html', (err, html) => {
    if(err) throw err
    let template = handlebars.compile(html)
    let replacements = {
      email: email,
      password: password
    }
    let htmlToSend = template(replacements)
    let msg = {
      from: `Edge Commerce Admin <${process.env.SU_EMAIL}>`,
      to: email,
      subject: 'Account verification',
      html: htmlToSend,

    }
    transporter.sendMail(msg)
  })
}