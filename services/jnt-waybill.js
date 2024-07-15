const Excel = require('exceljs')
const moment = require('moment')
const fs = require('fs')
const archiver = require('archiver')
const File = require('../models/File')
const Booking = require('../models/Booking')
const {encryptBody, qr, barcode, barcodeVertical} = require('./../utils/jnt-encrypt')
const addrBuild = require('./../utils/address-build')
const jtWaybillLog = require('../utils/jt-waybill-log')
const fetch = require('node-fetch')

let generate = async (booking, jntData, workbook, filename, waybillQuery) => {
  let worksheet = workbook.getWorksheet(1)
  let imgBarcode = workbook.addImage({
    filename: `./tmp/barcode-${jntData.responseitems[0].mailno}.png`,
    extension: 'png'
  })
  let imgBarcodeVert = workbook.addImage({
    filename: `./tmp/barcode-vert-${jntData.responseitems[0].mailno}.png`,
    extension: 'png'
  })
  let imgQrCode = workbook.addImage({
    filename: `./tmp/qr-${jntData.responseitems[0].mailno}.png`,
    extension: 'png'
  })

  worksheet.addImage(imgBarcode, 'C1:F3')
  worksheet.addImage(imgBarcodeVert, {
    tl: { col: 7.1, row: 19.2 },
    br: { col: 8, row: 33 }
  })
  worksheet.addImage(imgQrCode, 'F35:G40')

  worksheet.getCell('E4').value = moment(booking.createdAt).format('M/DD/YYYY hh:mm:ss a')
  worksheet.getCell('E16').value = moment(booking.createdAt).format('M/DD/YYYY hh:mm:ss a')
  worksheet.getCell('C4').value = jntData.responseitems[0].txlogisticid
  worksheet.getCell('C16').value = jntData.responseitems[0].txlogisticid

  worksheet.getCell('G1:H3').value = waybillQuery.responseitems[0].orderList[0].expresstype
  worksheet.getCell('G13:H15').value = waybillQuery.responseitems[0].orderList[0].expresstype
  
  worksheet.getCell('C5').value = booking.customer
  worksheet.getCell('A6').value = `${booking.province}, ${booking.city}, ${booking.brgy}`
  worksheet.getCell('C9').value = booking.keyPartnerId.name
  worksheet.getCell('A10').value = `${booking.keyPartnerId.addr.province}, ${booking.keyPartnerId.addr.city}, ${booking.keyPartnerId.addr.brgy}`
  worksheet.getCell('F9').value = booking.cod
  worksheet.getCell('F10').value = booking.itemId.desc
  worksheet.getCell('F11').value = booking.quantity
  worksheet.getCell('H11').value = '1'
  worksheet.getCell('A17').value = jntData.responseitems[0].sortingcode
  worksheet.getCell('A20').value = booking.city
  worksheet.getCell('C22').value = booking.customer
  worksheet.getCell('A23').value = `${booking.province}, ${booking.city}, ${booking.brgy}`
  worksheet.getCell('C27').value = booking.keyPartnerId.name
  worksheet.getCell('A28').value = `${booking.keyPartnerId.addr.province}, ${booking.keyPartnerId.addr.city}, ${booking.keyPartnerId.addr.brgy}`
  worksheet.getCell('B30').value = booking.cod
  worksheet.getCell('B31').value = booking.itemId.desc
  worksheet.getCell('B32').value = booking.quantity
  worksheet.getCell('D32').value = '1'
  worksheet.getCell('A35').value = booking.remarks

  worksheet.getCell('I1').value = jntData.responseitems[0].mailno
  worksheet.getCell('I16').value = jntData.responseitems[0].mailno
  worksheet.getCell('I29').value = jntData.responseitems[0].mailno
  worksheet.getCell('A42').value = jntData.responseitems[0].mailno
  worksheet.getCell('E42').value = jntData.responseitems[0].mailno

  await workbook.xlsx.writeFile(`./uploads/jt-waybill/${filename}`, { useSharedStrings: true, useStyles: true })

  fs.unlinkSync(`./tmp/qr-${jntData.responseitems[0].mailno}.png`)
  fs.unlinkSync(`./tmp/barcode-${jntData.responseitems[0].mailno}.png`)
  fs.unlinkSync(`./tmp/barcode-vert-${jntData.responseitems[0].mailno}.png`)

  return { link: `/jt-waybill/${filename}`, waybillNo: jntData.responseitems[0].mailno,  filename }

}

let generateLogisticsInt = (booking) => {
  let items = [{
    itemname: booking.itemId.desc,
    number: booking.quantity,
    itemvalue: booking.itemId.price,
    desc: booking.itemId.desc
  }]
  return {
    actiontype: 'add',
    environment: process.env.JNT_ENV,
    eccompanyid: process.env.JNT_ECCOMPANY_ID,
    customerid: process.env.JNT_CUSTOMER_ID,
    txlogisticid: booking.bookingId,
    ordertype: '1',
    servicetype: '6',
    deliverytype: '1',
    sender: {
      name: booking.sender,
      postcode: booking.keyPartnerId.addr.zip,
      mobile: booking.senderContact,
      prov: booking.keyPartnerId.addr.province,
      city: booking.keyPartnerId.addr.city,
      area: booking.keyPartnerId.addr.brgy,
      address: addrBuild(booking.keyPartnerId.addr)
    },
    receiver: {
      name: booking.customer,
      postcode: booking.zip,
      mailbox: '',
      mobile: booking.customerContact,
      phone: '',
      prov: booking.province,
      city: booking.city,
      area: booking.brgy,
      address: booking.hsStNum
    },
    createordertime: booking.createdAt,
    paytype: '1',
    weight: '',
    itemsvalue: booking.cod,
    totalquantity: booking.quantity,
    remark: `Color: ${booking.itemId.color.name}, Size: ${booking.itemId.size.name}`,
    items: items
  }
}

let generateSingleWaybill = async (booking) => {
  let reqBody = generateLogisticsInt(booking)
  let waybill = await requestWaybillNumber(reqBody)
  let waybillQuery = await requestOrderQuery(waybill.responseitems[0].mailno)
  let workbook = new Excel.Workbook()
  let filename = `booking-${booking.bookingId}.xlsx`
  qr(waybill.responseitems[0].mailno)
  barcode(waybill.responseitems[0].mailno)
  return workbook.xlsx.readFile('./templates/jnt-waybill.xlsx')
    .then(async () => {
      return generate(booking, waybill, workbook, filename, waybillQuery)
    })
}

let requestWaybillNumber = async (body) => {
  try {
    let urlencode = new URLSearchParams()
    urlencode.append('eccompanyid', process.env.JNT_ECCOMPANY_ID)
    urlencode.append('logistics_interface', JSON.stringify(body))
    urlencode.append('data_digest', encryptBody(body))
    urlencode.append('msg_type', 'ORDERCREATE')
    let resp = await fetch(
      process.env.JNT_CREATE_WAYBILL_URL,
      {
        method: 'post',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: urlencode
      }
    )
    let data = await resp.json()
    jtWaybillLog(await data, '\n')
    return await data
  } catch(e) {
    console.log(e)
  }
}

let requestOrderQuery = async (waybill) => {
  try {
    let body = { eccompanyid: process.env.JNT_ECCOMPANY_ID, customerid: process.env.JNT_CUSTOMER_ID, command: 2, serialnumber: waybill }
    let urlencode = new URLSearchParams()
    urlencode.append('eccompanyid', process.env.JNT_ECCOMPANY_ID)
    urlencode.append('logistics_interface', JSON.stringify(body))
    urlencode.append('data_digest', encryptBody(body))
    urlencode.append('msg_type', 'ORDERQUERY')
    let resp = await fetch(
      process.env.JNT_QUERY_ORDER,
      {
        method: 'post',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: urlencode
      }
    )
    let data = await resp.json()
    jtWaybillLog(await data, '\n\n')
    return await data
  } catch(e) {
    console.log(e)
  }
}

let cancelOrderQuery = async (txlogisticid) => {
  try {
    let body = { eccompanyid: process.env.JNT_ECCOMPANY_ID, customerid: process.env.JNT_CUSTOMER_ID, txlogisticid, reason: 'Cancelled by seller' }
    let urlencode = new URLSearchParams()
    urlencode.append('eccompanyid', process.env.JNT_ECCOMPANY_ID)
    urlencode.append('logistics_interface', JSON.stringify(body))
    urlencode.append('data_digest', encryptBody(body))
    urlencode.append('msg_type', 'ORDERCANCEL')
    await fetch(process.env.JNT_CANCEL_ORDER, {
      method: 'post',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: urlencode
    })
  } catch(e) {
    console.log(e)
  }
}
module.exports = {
  generateSingleWaybill,
  cancelOrderQuery
}