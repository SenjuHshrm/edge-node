const Excel = require('exceljs')
const moment = require('moment')
const fs = require('fs')
const {
  defGrayFill,
  defDarkGrayFill,
  defRightBorder,
  centerAlign
} = require('../utils/excel-formatting')

const totalPrice = (items) => {
  let total = 0
  for(let i = 0; i < items.length; i++) {
    total += +items[i].totalPrice
  }
  return total
}

module.exports = (quote) => {
  let workbook = new Excel.Workbook()
  let filename = `${quote.quotationId}.xlsx`
  return workbook.xlsx.readFile('./templates/quotation.xlsx')
    .then(async () => {
      let worksheet = workbook.getWorksheet('Quotation Template')

      worksheet.getCell('E9').value = quote.keyPartnerId.name
      worksheet.getCell('E10').value = quote.keyPartnerId.company
      worksheet.getCell('E11').value = quote.keyPartnerId.addr
      worksheet.getCell('E12').value = quote.keyPartnerId.contact
      worksheet.getCell('D15').value = quote.quotationId
      worksheet.getCell('I15').value = moment(quote.createdAt).format('MM/DD/YYYY')
      worksheet.getCell('I16').value = moment(quote.validUntil).format('MM/DD/YYYY')
      worksheet.getCell('I20').value = totalPrice(quote.items)
      worksheet.getCell('I23').value = totalPrice(quote.items)
      worksheet.getCell('G34').value = quote.keyPartnerId.name
      worksheet.getCell('I28').value = moment().format('MM/DD/YYYY')
      worksheet.getCell('I34').value = moment().format('MM/DD/YYYY')

      let imgId = workbook.addImage({
        filename: './media/signature.png',
        extension: 'png',

      })
      worksheet.addImage(imgId, {
        tl: { col: 7.5, row: 25 },
        br: { col: 8.6, row: 27 },
        editAs: 'oneCell'
      })

      for(let i = 0; i < quote.items.length; i++) {
        let row = []
        row[3] = i + 1
        row[4] = quote.items[i].description
        row[6] = +quote.items[i].price
        row[7] = +quote.items[i].quantity
        row[8] = +(+quote.items[i].price * 0.15).toFixed(2)
        row[9] = +quote.items[i].totalPrice
        worksheet.insertRow(19 + i, row)

        worksheet.mergeCells(`D${19 + i}:E${19 + i}`)
        worksheet.getCell(`D${19 + i}`).alignment = centerAlign
        worksheet.getCell(`F${19 + i}`).alignment = centerAlign
        worksheet.getCell(`G${19 + i}`).alignment = centerAlign
        worksheet.getCell(`H${19 + i}`).alignment = centerAlign
        worksheet.getCell(`I${19 + i}`).alignment = centerAlign

        worksheet.getCell(`C${19 + i}`).fill = defGrayFill
        worksheet.getCell(`D${19 + i}`).fill = defGrayFill
        worksheet.getCell(`E${19 + i}`).fill = defGrayFill
        worksheet.getCell(`F${19 + i}`).fill = defGrayFill
        worksheet.getCell(`G${19 + i}`).fill = defGrayFill
        worksheet.getCell(`H${19 + i}`).fill = defGrayFill
        worksheet.getCell(`I${19 + i}`).fill = defDarkGrayFill
        worksheet.getCell(`K${19 + i}`).border = defRightBorder

        worksheet.getCell(`F${19 + i}`).numFmt = '₱ #,##0.00'
        worksheet.getCell(`H${19 + i}`).numFmt = '₱ #,##0.00'
        worksheet.getCell(`I${19 + i}`).numFmt = '₱ #,##0.00'
        worksheet.getCell(`I${19 + i}`).font = { color: { argb: '00FFFFFF' } }
      }

      await workbook.xlsx.writeFile(`./temp/${filename}`)
      let file = fs.readFileSync(`./temp/${filename}`)
      let encode = new Buffer.from(file).toString('base64')
      return { file: encode, filename: filename }
    })
    .catch((e) => {
      console.log(e)
      return { file: null, filename: '' }
    })
    .finally(() => {
      fs.unlinkSync(`./temp/${filename}`)
    })
}