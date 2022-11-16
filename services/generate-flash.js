const Excel = require('exceljs')
const File = require('../models/File')
const moment = require('moment')
const fs = require('fs')
const Inventory = require('../models/Inventory')

module.exports = (booking, id) => {
  let workbook = new Excel.Workbook()
  let filename = `flash-export-${moment().format('MMDDYYYY')}-${id}.xlsx`
  return workbook.xlsx.readFile('./templates/flash.xlsx')
    .then(async () => {
      let worksheet = workbook.getWorksheet(1)
      for(let j = 0; j < booking.length; j ++) {
        let itemLs = [];
        if(booking[j].itemType === 'individual') {
          itemLs.push(`Color: ${booking[j].itemId.color.name}, Size: ${booking[j].itemId.size.name}`)
        } else if(booking[j].itemType === 'bundle') {
          for(let k = 0; k < booking[j].bundleId.items.length; k++) {
            let i = await Inventory.findById(booking[j].bundleId.items[k].itemId).populate({ path: 'color size' }).exec()
            itemLs.push(`Name: ${i.desc}, Color: ${i.color.name}, Size: ${i.size.name}`)
          }
        }

        worksheet.getRow(j + 2).height = 15 * (itemLs.length * 2)

        // worksheet.getCell(`A${j + 2}`).alignment = { vertical: 'top', horizontal: 'left' }
        // worksheet.getCell(`B${j + 2}`).alignment = { vertical: 'top', horizontal: 'left' }
        // worksheet.getCell(`C${j + 2}`).alignment = { vertical: 'top', horizontal: 'left' }
        // worksheet.getCell(`D${j + 2}`).alignment = { vertical: 'top', horizontal: 'left' }
        // worksheet.getCell(`E${j + 2}`).alignment = { vertical: 'top', horizontal: 'left' }
        // worksheet.getCell(`F${j + 2}`).alignment = { vertical: 'top', horizontal: 'left' }
        // worksheet.getCell(`G${j + 2}`).alignment = { vertical: 'top', horizontal: 'left' }
        // worksheet.getCell(`H${j + 2}`).alignment = { vertical: 'top', horizontal: 'left' }
        // worksheet.getCell(`I${j + 2}`).alignment = { vertical: 'top', horizontal: 'left' }
        // worksheet.getCell(`J${j + 2}`).alignment = { vertical: 'top', horizontal: 'left' }
        // worksheet.getCell(`K${j + 2}`).alignment = { vertical: 'top', horizontal: 'left' }
        // worksheet.getCell(`L${j + 2}`).alignment = { vertical: 'top', horizontal: 'left' }
        // worksheet.getCell(`M${j + 2}`).alignment = { vertical: 'top', horizontal: 'left' }
        // worksheet.getCell(`O${j + 2}`).alignment = { vertical: 'top', horizontal: 'left' }

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
        worksheet.getCell(`M${j + 2}`).value = (booking[j].itemType === 'individual') ? booking[j].itemId.desc : booking[j].bundleId.name
        
        worksheet.getCell(`N${j + 2}`).value = (booking[j].itemType === 'individual') ? { richText: [{ text: `Color: ${booking[j].itemId.color.name}, ` }, { text: `Size: ${booking[j].itemId.size.name}` }] } : { richText: [{ text: itemLs.join(' \r\n') }] }
        worksheet.getCell(`O${j + 2}`).value = booking[j].cod

        
        worksheet.getCell(`N${j + 2}`).alignment = { wrapText: true }

        
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