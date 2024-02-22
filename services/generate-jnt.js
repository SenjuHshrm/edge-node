const Excel = require('exceljs')
const File = require('../models/File')
const moment = require('moment')
const fs = require('fs')
const Inventory = require('../models/Inventory')

module.exports = (booking, id) => {
  let workbook = new Excel.Workbook()
  let filename = `jnt-export-${moment().format('MMDDYYYY')}-${id}.xlsx`
  return workbook.xlsx.readFile('./templates/jnt.xlsx')
    .then(async () => {
      let worksheet = workbook.getWorksheet(1)
      for(let j = 0; j < booking.length; j ++) {
        let remarkVal = []
        if(booking[j].itemType === 'individual') {
          remarkVal.push(`Color: ${booking[j].itemId.color.name}, Size: ${booking[j].itemId.size.name}, Booking ID: ${booking[j].bookingId}`)
        } else if(booking[j].itemType === 'bundle') {
          for(let k = 0; k < booking[j].bundleId.items.length; k++) {
            let i = await Inventory.findById(booking[j].bundleId.items[k].itemId).populate({ path: 'color size' }).exec()
            remarkVal.push(`Name: ${i.desc}, Color: ${i.color.name}, Size: ${i.size.name}, Booking ID: ${booking[j].bookingId}`)
          }
        }

        worksheet.getRow(j + 9).height = 15 * (remarkVal.length * 2)

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
        worksheet.getCell(`M${j + 9}`).value = (booking[j].itemType === 'individual') ? remarkVal[0] : remarkVal.join(' \r\n')
      
        worksheet.getCell(`M${j + 9}`).alignment = { wrapText: true }
      
      }
      await workbook.xlsx.writeFile(`./temp/${filename}`, { useSharedStrings: true, useStyles: true })
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