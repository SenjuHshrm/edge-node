const Excel = require('exceljs')
const moment = require('moment')
const fs = require('fs')
const {
  defGrayFill,
  defOrangeFill,
  defRightBorder,
  centerAlign
} = require('../utils/excel-formatting')

const buildSKU = (inv) => {
  return `SKU-EC-${inv.classification.code}-${inv.code.code}-${inv.color.code}-${inv.size.code}-${inv.sequence}`
}

module.exports = (inv, id) => {
  let workbook = new Excel.Workbook()
  let filename = `inventory-${moment().format('MMDDYYYY')}-${id}.xlsx`
  return workbook.xlsx.readFile('./templates/inventory.xlsx')
    .then(async () => {
      let worksheet = workbook.getWorksheet(1)
      for(let i = 0; i < inv.length; i++) {
        let row = []
        row[1] = i + 1
        row[2] = inv[i].desc
        row[3] = inv[i].classification.name
        row[4] = `EC-${inv[i].classification.code}`
        row[5] = inv[i].code.code
        row[6] = inv[i].color.code.toString()
        row[7] = inv[i].size.code.toString()
        row[8] = inv[i].sequence.toString()
        row[9] = buildSKU(inv[i])
        row[10] = inv[i].in.toString()
        row[11] = inv[i].out.toString()
        row[12] = inv[i].defective.toString()
        row[13] = inv[i].rts.toString()
        row[14] = inv[i].currentQty.toString()
        row[15] = +inv[i].price
        row[16] = +(+inv[i].price * +inv[i].out).toFixed(2)
        row[18] = inv[i].currentQty.toString()
        row[19] = +inv[i].price
        row[20] = +(+inv[i].price * +inv[i].currentQty).toFixed(2)
        worksheet.insertRow(3 + i, row, '')

        worksheet.getCell(`A${3 + i}`).alignment = centerAlign
        worksheet.getCell(`B${3 + i}`).alignment = centerAlign
        worksheet.getCell(`C${3 + i}`).alignment = centerAlign
        worksheet.getCell(`D${3 + i}`).alignment = centerAlign
        worksheet.getCell(`E${3 + i}`).alignment = centerAlign
        worksheet.getCell(`F${3 + i}`).alignment = centerAlign
        worksheet.getCell(`G${3 + i}`).alignment = centerAlign
        worksheet.getCell(`H${3 + i}`).alignment = centerAlign
        worksheet.getCell(`I${3 + i}`).alignment = centerAlign
        worksheet.getCell(`J${3 + i}`).alignment = centerAlign
        worksheet.getCell(`K${3 + i}`).alignment = centerAlign
        worksheet.getCell(`L${3 + i}`).alignment = centerAlign
        worksheet.getCell(`M${3 + i}`).alignment = centerAlign
        worksheet.getCell(`N${3 + i}`).alignment = centerAlign
        worksheet.getCell(`O${3 + i}`).alignment = centerAlign
        worksheet.getCell(`O${3 + i}`).numFmt = '₱#,##0.00'
        worksheet.getCell(`P${3 + i}`).alignment = centerAlign
        worksheet.getCell(`P${3 + i}`).numFmt = '₱#,##0.00'
        worksheet.getCell(`R${3 + i}`).alignment = centerAlign
        worksheet.getCell(`R${3 + i}`).numFmt = '₱#,##0.00'
        worksheet.getCell(`S${3 + i}`).alignment = centerAlign
        worksheet.getCell(`S${3 + i}`).numFmt = '₱#,##0.00'
        worksheet.getCell(`T${3 + i}`).alignment = centerAlign
        worksheet.getCell(`T${3 + i}`).numFmt = '₱#,##0.00'
      }
      await workbook.xlsx.writeFile(`./temp/${filename}`)
      let file = fs.readFileSync(`./temp/${filename}`)
      let encode = new Buffer.from(file).toString('base64')
      return { file: encode, filename: filename }
    })
    .catch(e => {
      console.log(e)
      return { file: null, filename: '' }
    })
    .finally(() => {
      fs.unlinkSync(`./temp/${filename}`)
    })
}