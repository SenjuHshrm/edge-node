const Excel = require('exceljs')
const moment = require('moment')
const fs = require('fs')
const archiver = require('archiver')
const {
  defGrayFill,
  defOrangeFill,
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

const generate = async (po, workbook, filename) => {
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
    tl: { col: 7.5, row: 28 + po.items.length },
    br: { col: 8.6, row: 31 + po.items.length },
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

    // worksheet.mergeCells(`D${18 + i}:E${18 + i}`)
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

    worksheet.getCell(`H${18 + i}`).numFmt = '₱#,##0.00'
    worksheet.getCell(`I${18 + i}`).numFmt = '₱#,##0.00'
  }

  await workbook.xlsx.writeFile(`./temp/${filename}`)
  let file = fs.readFileSync(`./temp/${filename}`)
  let encode = new Buffer.from(file).toString('base64')
  return { file: encode, filename: filename }
}

module.exports = {
  /**
   * 
   */
  generateSinglePO: (po) => {
    let workbook = new Excel.Workbook()
    let filename = `${po.poId}.xlsx`
    return workbook.xlsx.readFile('./templates/purchase-order.xlsx')
      .then(async () => {
        return generate(po, workbook, filename)
      })
      .catch(e => {
        console.log(e)
        return { file: null, filename: '' }
      })
      .finally(() => {
        fs.unlinkSync(`./temp/${filename}`)
      })
  },

  /**
   * 
   */
  generateMultiplePO: async (pos, userId) => {
    let filename = `${userId}-purchase-order-${moment().format('MMDDYYYY')}.zip`,
        poFiles = [],
        output = fs.createWriteStream(`./temp/${filename}`),
        archive = archiver('zip');
    archive.pipe(output)
    try {
      for(let i = 0; i < pos.length; i++) {
        let workbook = new Excel.Workbook()
        let newFile = await workbook.xlsx.readFile('./templates/purchase-order.xlsx').then(() => {return generate(pos[i], workbook, `${pos[i].poId}.xlsx`)})
        await archive.file(`./temp/${newFile.filename}`, { name: newFile.filename })
        poFiles.push(`./temp/${newFile.filename}`)
      }
      await archive.finalize()
      let fileFromDB = await File.findOne({ filePath: `/temp/${filename}` }).exec()
      if(fileFromDB === null) {
        await new File({ filePath: `/temp/${filename}` }).save()
      }
      return { filename: filename, link: `/${filename}` }
    } catch(e) {

    } finally {
      for(let i = 0; i < poFiles.length; i++) {
        fs.unlinkSync(poFiles[i])
      }
    }
  }
}

// orange = rgb(240, 182, 99)
// gray = rgb(242, 242, 242)

// let workbook = new Excel.Workbook()
//     let filename = `${userId}-purchase-order-${moment().format('MMDDYYYY')}.zip`
//     let poFiles = []
//     return workbook.xlsx.readFile('./templates/purchase-order.xlsx')
//       .then(async () => {
//         let files = []
//         for(let i = 0; i < pos.length; i++) {
//           files.push(await generate(pos[i], workbook, `${pos[i].poId}.xlsx`))
//         }
//         return files
//       })
//       .then(async (files) => {
//         let output = fs.createWriteStream(`./temp/${filename}`)
//         let archive = archiver('zip')
//         archive.pipe(output)
//         for(let i = 0; i < files.length; i++) {
//           archive.file(`./temp/${files[i].filename}`, { name: files[i].filename })
//           poFiles.push(`./temp/${files[i].filename}`)
//         }
//         await archive.finalize()
//         let fileFromDB = await File.findOne({ filePath: `./temp/${filename}` })
//         if(fileFromDB === null) {
//           await new File({ filePath: `/temp/${filename}`, from: null }).save()
//         }
//         return { filename: filename, link: `/${filename}` }
//       })
//       .catch(e => {
//         console.log(e)
//         return { file: null, filename: '' }
//       })
//       .finally(() => {
//         for(let i = 0; i < poFiles.length; i++) {
//           fs.unlinkSync(poFiles[i])
//         }
//       })