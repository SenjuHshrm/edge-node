const Excel = require('exceljs')
const fs = require('fs')
const moment = require('moment')
const archiver = require('archiver')
const {
  defGrayFill,
  defOrangeFill,
  defRightBorder,
  centerAlign
} = require('../utils/excel-formatting')
const File = require('../models/File')

const totalQuantity = (items) => {
  let total = 0;
  for(let i = 0; i < items.length; i++) {
    total += items[i].quantity
  }
  return total
}

const generate = async (inq, workbook, filename) => {
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
}

module.exports = {
  /**
   * Generates excel file of inquiry from the template
   * @param {*} inq 
   * @returns Excel file of single inquiry
   */
  generateSingleInquiry: (inq) => {
    let workbook = new Excel.Workbook()
    let filename = `${inq.inqId}.xlsx`
    return workbook.xlsx.readFile('./templates/inquiry.xlsx')
      .then(async () => {
        return await generate(inq, workbook, filename)
      })
      .catch(err => {
        console.log(err)
        return { file: null, filename: '' }
      })
      .finally(() => {
        fs.unlinkSync(`./temp/${filename}`)
      })
  },

  /**
   * Generates compilation of selected inquiries to generate
   * @param {*} inqs 
   * @returns "{ filename: 'File name', link: 'Link to file generated' }"
   */
  generateMultipleInquiry: async (inqs, userId) => {
    let filename = `${userId}-inquiries-${moment().format('MMDDYYYY')}.zip`,
        inqFiles = [],
        output = fs.createWriteStream(`./temp/${filename}`),
        archive = archiver('zip');
    archive.pipe(output)
    try {
      for(let i = 0; i < inqs.length; i++) {
        let workbook = new Excel.Workbook()
        let newFile = await workbook.xlsx.readFile('./templates/inquiry.xlsx').then(() => {return generate(inqs[i], workbook, `${inqs[i].inqId}.xlsx`)})
        await archive.file(`./temp/${newFile.filename}`, { name: newFile.filename })
        inqFiles.push(`./temp/${newFile.filename}`)
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
      for(let i = 0; i < inqFiles.length; i++) {
        fs.unlinkSync(inqFiles[i])
      }
    }
  }
}