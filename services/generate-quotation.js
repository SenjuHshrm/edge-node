const Excel = require('exceljs')
const moment = require('moment')
const fs = require('fs')
const archiver = require('archiver')
const {
  defGrayFill,
  defDarkGrayFill,
  defRightBorder,
  centerAlign
} = require('../utils/excel-formatting')
const File = require('../models/File')

const totalPrice = (items) => {
  let total = 0
  for(let i = 0; i < items.length; i++) {
    total += +items[i].totalPrice
  }
  return total
}

const generate = async (quote, workbook, filename) => {
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
}

module.exports = {
  /**
   * Generates excel file of quotation from the template
   * @param {*} quote 
   * @returns Excel file of single quotation
   */
  generateSingleQuotation: (quote) => {
    let workbook = new Excel.Workbook()
    let filename = `${quote.quotationId}.xlsx`
    return workbook.xlsx.readFile('./templates/quotation.xlsx')
      .then(async () => {
        return generate(quote, workbook, filename)
      })
      .catch((e) => {
        console.log(e)
        return { file: null, filename: '' }
      })
      .finally(() => {
        fs.unlinkSync(`./temp/${filename}`)
      })
  },

  /**
   * Generates compilation of selected quotations to generate
   * @param {*} quotes 
   * @returns "{ filename: 'File name', link: 'Link to file generated' }"
   */
  generateMultipleQuoatation: async (quotes, userId) => {
    let filename = `${userId}-quotations-${moment().format('MMDDYYYY')}.zip`,
        quoteFiles = [],
        output = fs.createWriteStream(`./temp/${filename}`),
        archive = archiver('zip');
    archive.pipe(output)
    try {
      for(let i = 0; i < quotes.length; i++) {
        let workbook = new Excel.Workbook()
        let newFile = await workbook.xlsx.readFile('./templates/quotation.xlsx').then(() => {return generate(quotes[i], workbook, `${quotes[i].quotationId}.xlsx`)})
        await archive.file(`./temp/${newFile.filename}`, { name: newFile.filename })
        quoteFiles.push(`./temp/${newFile.filename}`)
      }
      await archive.finalize()
      let fileFromDB = await File.findOne({ filePath: `/temp/${filename}` }).exec()
      if(fileFromDB === null) {
        await new File({ filePath: `/temp/${filename}` }).save()
      }
      return { filename: filename, link: `/${filename}` }
    } catch(e) {
      console.log(e)
      return { filename: '', link: '' }
    } finally {
      for(let i = 0; i < quoteFiles.length; i++) {
        fs.unlinkSync(quoteFiles[i])
      }
    }
  }
}