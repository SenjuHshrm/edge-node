const Excel = require('exceljs')
const moment = require('moment')
const fs = require('fs')
const {
  defGrayFill,
  defOrangeFill,
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

module.exports = (po) => {
  let workbook = new Excel.Workbook()
  let filename = `${po.poId}.xlsx`
  return workbook.xlsx.readFile('./templates/purchase-order.xlsx')
    .then(async () => {
      let worksheet = workbook.getWorksheet(1)

      worksheet.getCell('E9').value = po.keyPartnerId.name
      worksheet.getCell('E10').value = po.keyPartnerId.company
      worksheet.getCell('E11').value = po.keyPartnerId.addr
      worksheet.getCell('E12').value = po.keyPartnerId.contact
      worksheet.getCell('D15').value = po.poId
      worksheet.getCell('I15').value = moment(po.createdAt).format('MM/DD/YYYY')
      worksheet.getCell('I19').value = totalPrice(po.items)
      worksheet.getCell('I22').value = totalPrice(po.items)
      worksheet.getCell('F27').value = po.keyPartnerId.name
      worksheet.getCell('I27').value = moment().format('MM/DD/YYYY')
      worksheet.getCell('I33').value = moment().format('MM/DD/YYYY')

      let imgId = workbook.addImage({
        filename: './media/signature.png',
        extension: 'png',

      })
      worksheet.addImage(imgId, {
        tl: { col: 7.5, row: 29 },
        br: { col: 8.6, row: 32 },
        editAs: 'oneCell'
      })

      for(let i = 0; i < po.items.length; i++) {
        let row = []
        row[3] = i + 1
        row[4] = po.items[i].description
        row[6] = +po.items[i].quantity
        row[7] = po.items[i].unitPrice
        row[8] = +po.items[i].price
        row[9] = +po.items[i].totalPrice
        worksheet.insertRow(18 + i, row)

        worksheet.mergeCells(`D${18 + i}:E${18 + i}`)
        worksheet.getCell(`D${18 + i}`).alignment = centerAlign
        worksheet.getCell(`F${18 + i}`).alignment = centerAlign
        worksheet.getCell(`G${18 + i}`).alignment = centerAlign
        worksheet.getCell(`H${18 + i}`).alignment = centerAlign
        worksheet.getCell(`I${18 + i}`).alignment = centerAlign

        worksheet.getCell(`C${18 + i}`).fill = defGrayFill
        worksheet.getCell(`D${18 + i}`).fill = defGrayFill
        worksheet.getCell(`E${18 + i}`).fill = defGrayFill
        worksheet.getCell(`F${18 + i}`).fill = defGrayFill
        worksheet.getCell(`G${18 + i}`).fill = defGrayFill
        worksheet.getCell(`H${18 + i}`).fill = defGrayFill
        worksheet.getCell(`I${18 + i}`).fill = defOrangeFill
        worksheet.getCell(`K${18 + i}`).border = defRightBorder

        worksheet.getCell(`H${18 + i}`).numFmt = '₱ #,##0.00'
        worksheet.getCell(`I${18 + i}`).numFmt = '₱ #,##0.00'
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

// orange = rgb(240, 182, 99)
// gray = rgb(242, 242, 242)