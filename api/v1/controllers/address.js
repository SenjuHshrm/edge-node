const fs = require('fs')
const { reset } = require('nodemon')
const { createInventory } = require('./inventory')

const modCity = (city) => {
  let res = city
  let param = city.match('CITY OF')
  if(param === null) {
    let temp = city.replace('CITY', '')
    res = temp
  }
  return res
}

module.exports = {
  /**
   * 
   */
  checkAddressToCourier: (req, res) => {
    fs.readFile(`${appRoot}/uploads/files/${req.params.type}.csv`, 'utf-8', (e, content) => {
      if(e) throw e
      // 7
      try {
        let isAvailable = 'NO', locations = content.split('\n');
        let paramCity = modCity(req.params.city)
        locations.splice((locations.length - 1), 1)
        let selectedProvince = locations.filter((x) => { return req.params.province.match(x.split(',')[1].toUpperCase()) })
        let selectedCity = selectedProvince.filter((x) => { return x.split(',')[2].toUpperCase().match(paramCity.trim()) })
        let selectedBrgy = selectedCity.filter((x) => { return req.params.brgy.match(x.split(',')[3].toUpperCase()) })
        isAvailable = selectedBrgy[0].split(',')[7]
        return res.status(200).json({ success: true, info: isAvailable })
      } catch(e) {
        console.log(e)
        return res.status(500).json({ success: false, msg: '' })
      }
    })
  }
}