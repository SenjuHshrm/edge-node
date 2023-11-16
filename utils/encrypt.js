const crypto = require('crypto')

const key = crypto
  .createHash('sha512')
  .update(process.env.ENCRYPTION_SECRET)
  .digest('hex')
  .substring(0, 32)

const encryptionIV = crypto
  .createHash('sha512')
  .update(process.env.ENCRYPTION_SECRET_IV)
  .digest('hex')
  .substring(0, 16)

let encryptData = (time) => {
  const cipher = crypto.createCipheriv(process.env.ENCRYPTION_METHOD, key, encryptionIV)
  return Buffer.from(cipher.update(time.toString(), 'utf-8', 'hex') + cipher.final('hex')).toString('base64')
}

let decryptData = (accessKey) => {
  const buff = Buffer.from(accessKey, 'base64')
  const decipher = crypto.createDecipheriv(process.env.ENCRYPTION_METHOD, key, encryptionIV)
  return (decipher.update(buff.toString('utf-8'), 'hex', 'utf8') + decipher.final('utf8'))
}

module.exports = {
  encryptData,
  decryptData
}