const crypto = require('crypto')
const QRCode = require('qrcode')
let JsBarcode = require('jsbarcode')
const { createCanvas, Canvas } = require('canvas')
const { createWriteStream, writeFileSync } = require('fs')
const bwipjs = require('bwip-js')

let qr = async (waybill) => {
  return await QRCode.toFile(`./tmp/qr-${waybill}.png`, waybill)
}

let barcode = async (waybill) => {
  bwipjs.toBuffer({
    bcid: 'code128',
    includetext: false,
    text: waybill,
    backgroundcolor: 'FFFFFF',
    paddingtop: 3,
    paddingbottom: 3,
    paddingleft: 3,
    paddingright: 3
  }, (err, png) => {
    writeFileSync(`./tmp/barcode-${waybill}.png`, png)
  })
  bwipjs.toBuffer({
    bcid: 'code128',
    includetext: false,
    text: waybill,
    rotate: 'R',
    backgroundcolor: 'FFFFFF',
    paddingtop: 3,
    paddingbottom: 3,
    paddingleft: 3,
    paddingright: 3
  }, (err, png) => {
    writeFileSync(`./tmp/barcode-vert-${waybill}.png`, png)
  })
}


let encryptBody = (body) => {
  let encr = crypto.createHash('md5').update(JSON.stringify(body) + process.env.JNT_KEY, 'utf-8').digest('hex')
  let buff = Buffer.from(encr, 'utf-8')
  // return btoa(buff.toString('utf-8'))
  return Buffer.from(buff.toString('utf-8')).toString('base64')
}

module.exports = {
  qr, encryptBody, barcode
}