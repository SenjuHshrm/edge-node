const Excel = require('exceljs')
const fs = require('fs')
const moment = require('moment')
const {
  defGrayFill,
  defOrangeFill,
  defRightBorder,
  centerAlign
} = require('../utils/excel-formatting')

const totalQuantity = (items) => {
  let total = 0;
  for(let i = 0; i < items.length; i++) {
    total += items[i].quantity
  }
  return total
}

module.exports = (inq) => {
  let workbook = new Excel.Workbook()
  let filename = `${inq.inqId}.xlsx`
  return workbook.xlsx.readFile('./templates/inquiry.xlsx')
    .then(async () => {
      let worksheet = workbook.getWorksheet('Product Cost Inquiry Form')
      // plot static location
      worksheet.getCell('E7').value = inq.keyPartnerId.name
      worksheet.getCell('E8').value = inq.keyPartnerId.company
      worksheet.getCell('H7').value = inq.inqId
      worksheet.getCell('H8').value = moment(inq.createdAt).format('MM/DD/YYYY')
      worksheet.getCell('F12').value = totalQuantity(inq.items)

      for(let i = 0; i < inq.items.length; i ++) {
        let row = []
        row[3] = i + 1
        row[4] = inq.items[i].description
        row[6] = inq.items[i].quantity
        row[7] = inq.items[i].units
        row[8] = inq.items[i].remarks
        worksheet.insertRow(11 + i, row, '')

        // format cells in new row

        // alignment and merged cells
        worksheet.mergeCells(`D${11 + i}:E${11 + i}`)
        worksheet.getCell(`D${11 + i}`).alignment = centerAlign
        worksheet.getCell(`F${11 + i}`).alignment = centerAlign
        worksheet.getCell(`G${11 + i}`).alignment = centerAlign
        worksheet.getCell(`H${11 + i}`).alignment = centerAlign

        // fill color
        worksheet.getCell(`C${11 + i}`).fill = defGrayFill
        worksheet.getCell(`D${11 + i}`).fill = defGrayFill
        worksheet.getCell(`E${11 + i}`).fill = defGrayFill
        worksheet.getCell(`F${11 + i}`).fill = defGrayFill
        worksheet.getCell(`G${11 + i}`).fill = defGrayFill
        worksheet.getCell(`H${11 + i}`).fill = defOrangeFill
        worksheet.getCell(`J${11 + i}`).border = defRightBorder

      }

      await workbook.xlsx.writeFile(`./temp/${filename}`)
      let file = fs.readFileSync(`./temp/${filename}`)
      let encode = new Buffer.from(file).toString('base64')
      return { file: encode, filename: filename }
    })
    .catch(err => {
      console.log(err)
      return { file: null, filename: '' }
    })
    .finally(() => {
      fs.unlinkSync(`./temp/${filename}`)
    })
}