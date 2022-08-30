const nodemailer = require('nodemailer')
const handlebars = require('handlebars')
const fs = require('fs')

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.SU_EMAIL,
    pass: process.env.SU_PASSWORD_APP
  }
})

exports.sendPassword = async (email, password, secPass) => {
  try {
    let file = fs.readFileSync(`${global.appRoot}/view/keypartner-password.html`, { encoding: 'utf-8' })
    let template = handlebars.compile(file)
    let replacements = {
      email: email, password: password, secPass: secPass
    }
    let html = template(replacements)
    let msg = {
      from: process.env.SU_EMAIL,
      to: email,
      subject: 'Account verification',
      html: html
    }
    await transporter.sendMail(msg)
  } catch(e) {
    console.log(e)
  }
}