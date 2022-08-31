/**
 *  Full address builder
 * @param {*} addr - Address Object { province, city, brgy, st }
 * @returns String
 */
module.exports = (addr) => {
  return `${addr.st}, ${addr.brgy}, ${addr.city}, ${addr.province}`
}