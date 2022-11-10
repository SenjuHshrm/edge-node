const fs = require('fs')
const writeLog = require('../../../utils/write-log')

const modCity = (city) => {
  let res = city, temp = '';
  if(city.match('CITY OF')) {
    temp = city.replace('CITY OF ', '')
    res = temp.trim()
  } else if(city.match('CITY')) {
    temp = city.replace('CITY', '')
    res = temp.trim()
  }
  return res
}

const modBrgy = (brgy) => {
  let res = brgy, ind = brgy.indexOf('(');
  if(ind !== -1) {
    res = brgy.substr(0, ind).trim()
  }
  return res
}

module.exports = {
  /**
   * 
   */
  checkAddressToCourier: (req, res) => {
    fs.readFile(`${appRoot}/uploads/files/${req.params.type}.csv`, 'latin1', (e, content) => {
      if(e) throw e
      // 7
      try {
        let isAvailable = 'NO',
          locations = content.split('\r\n'),
          paramCity = '',
          paramBrgy = modBrgy(req.params.brgy),
          selectedProvince = [],
          selectedBrgy = []
        switch(req.params.type) {
          case 'flash':
            paramCity = modCity(req.params.city)
            console.log(paramBrgy)
            locations.splice((locations.length - 1), 1)
            selectedProvince = locations.filter((x) => { return x.split(',')[1].toUpperCase().match(new RegExp(`${req.params.province}`)) })
            selectedCity = selectedProvince.filter((x) => { return x.split(',')[2].toUpperCase().match(new RegExp(`${paramCity}`)) })
            selectedBrgy = selectedCity.filter((x) => { return x.split(',')[3].toUpperCase().match(new RegExp(`${paramBrgy}`)) })
            isAvailable = selectedBrgy[0].split(',')[7]
            break;
          case 'jnt':
            let province = req.params.province.replace(' ', '-')
            paramCity = req.params.city.replace(/[ *]/g, '-')
            locations.splice((locations.length - 1), 1)
            selectedProvince = locations.filter((x) => { return x.split(',')[4].toUpperCase().match(new RegExp(`${province}`)) })
            selectedCity = selectedProvince.filter((x) => { return x.split(',')[5].toUpperCase().match(new RegExp(`${paramCity}`)) })
            selectedBrgy = selectedCity.filter((x) => { return x.split(',')[6].toUpperCase() === req.params.brgy })
            isAvailable = selectedBrgy[0].split(',')[7]
            break;
        }
        return res.status(200).json({ success: true, info: isAvailable })
      } catch(e) {
        writeLog('address', 'checkAddressToCourier', '00001', e.stack)
        return res.status(500).json({ success: false, msg: '' })
      }
    })
  }
}