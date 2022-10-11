const Excel = require('exceljs')
const File = require('../models/File')
const moment = require('moment')
const fs = require('fs')

module.exports = (booking, id) => {
  let workbook = new Excel.Workbook()
  let filename = `jnt-export-${moment().format('MMDDYYYY')}-${id}.xlsx`
  return workbook.xlsx.readFile('./templates/jnt.xlsx')
    .then(async () => {
      let worksheet = workbook.getWorksheet(1)
      for(let j = 0; j < booking.length; j ++) {
        let remarkVal;
        if(booking[j].itemType === 'individual') {
          remarkVal = `Color: ${booking[j].itemId.color.name}, Size: ${booking[j].itemId.size.name}`
        } else if(booking[j].itemType === 'bundle') {
          remarkVal = []
          booking[j].bundleId.items.forEach(item => {
            remarkVal.push(item.item)
          })
        }
        worksheet.getCell(`A${j + 9}`).value = booking[j].customer
        worksheet.getCell(`B${j + 9}`).value = booking[j].customerContact
        worksheet.getCell(`C${j + 9}`).value = `${booking[j].hsStNum}, ${booking[j].brgy}`
        worksheet.getCell(`D${j + 9}`).value = booking[j].province
        worksheet.getCell(`E${j + 9}`).value = booking[j].city
        worksheet.getCell(`F${j + 9}`).value = ''
        worksheet.getCell(`G${j + 9}`).value = ''
        worksheet.getCell(`H${j + 9}`).value = (booking[j].itemType === 'individual') ? booking[j].itemId.desc : booking[j].bundleId.name
        worksheet.getCell(`I${j + 9}`).value = ''
        worksheet.getCell(`J${j + 9}`).value = '1'
        worksheet.getCell(`K${j + 9}`).value = ''
        worksheet.getCell(`L${j + 9}`).value = booking[j].cod
        worksheet.getCell(`M${j + 9}`).value = (booking[j].itemType === 'individual') ? remarkVal : remarkVal.join(', ')
      }
      await workbook.xlsx.writeFile(`./temp/${filename}`)
      new File({ filePath: `/temp/${filename}`, from: null }).save()
      return { link: `/${filename}`, filename: filename }
    })
    .catch((e) => {
      console.log(e)
    })
    // .finally(() => {
    //   fs.unlinkSync(`./temp/${filename}`)
    // })
}