const Excel = require('exceljs')
const File = require('../models/File')
const moment = require('moment')
const fs = require('fs')

module.exports = (booking, id) => {
  let workbook = new Excel.Workbook()
  let filename = `flash-export-${moment().format('MMDDYYYY')}-${id}.xlsx`
  return workbook.xlsx.readFile('./templates/flash.xlsx')
    .then(async () => {
      let worksheet = workbook.getWorksheet(1)
      for(let j = 0; j < booking.length; j ++) {
        let itemLs = [];
        if(booking[j].itemType === 'individual') {
          itemLs.push(booking[j].itemId.desc)
        } else if(booking[j].itemType === 'bundle') {
          booking[j].bundleId.items.forEach(item => {
            itemLs.push(item.item)
          })
        }
        worksheet.getCell(`A${j + 2}`).value = booking[j].bookingId
        worksheet.getCell(`B${j + 2}`).value = booking[j].customer
        worksheet.getCell(`C${j + 2}`).value = `${booking[j].hsStNum}, ${booking[j].brgy}, ${booking[j].city}, ${booking[j].province}`
        worksheet.getCell(`D${j + 2}`).value = booking[j].zip
        worksheet.getCell(`E${j + 2}`).value = booking[j].customerContact
        worksheet.getCell(`F${j + 2}`).value = ''
        worksheet.getCell(`G${j + 2}`).value = booking[j].cod
        worksheet.getCell(`H${j + 2}`).value = (booking[j].itemType === 'individual') ? booking[j].itemId.classification.name : booking[j].itemType
        worksheet.getCell(`I${j + 2}`).value = ''
        worksheet.getCell(`J${j + 2}`).value = ''
        worksheet.getCell(`K${j + 2}`).value = ''
        worksheet.getCell(`L${j + 2}`).value = ''
        worksheet.getCell(`M${j + 2}`).value = (booking[j].itemType === 'individual') ? itemLs[0] : itemLs.join(', ')
        worksheet.getCell(`N${j + 2}`).value = (booking[j].itemType === 'individual') ? { richText: [{ text: `Color: ${booking[j].itemId.color.name}` }, { text: ` \r\nSize: ${booking[j].itemId.size.name}` }] } : booking[j].itemType
        worksheet.getCell(`O${j + 2}`).value = booking[j].cod
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