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
    let resLocations = {}
    try {
      let file = fs.readFileSync(`${appRoot}/uploads/files/${req.params.type}.csv`, 'latin1')
      let locations = file.split('\r\n'), provinces, cities, brgys;
      if(req.params.type === 'flash') {
        let provincesAvailableFlash = locations.filter(x => x.split(',')[7] === 'YES')
        let provincesOnlyFlash = provincesAvailableFlash.map(x => x.split(',')[1])
        provinces = [...new Set(provincesOnlyFlash)].sort()
        provinces.forEach(province => {
          resLocations[province] = {
            municipality_list: {}
          }
          let citiesFlash = provincesAvailableFlash.filter(x => x.split(',')[1] === province)
          let citiesOnlyFlash = citiesFlash.map(x => x.split(',')[2])
          cities = [...new Set(citiesOnlyFlash)]
          cities.forEach(city => {
            resLocations[province].municipality_list[city] = { barangay_list: [] }
            let brgysFlash = citiesFlash.filter(x => x.split(',')[2] === city)
            let brgysOnlyFlash = brgysFlash.map(x => x.split(',')[3])
            resLocations[province].municipality_list[city].barangay_list = brgysOnlyFlash
          })
        })
      } else if(req.params.type === 'jnt') {
        let provincesAvailableJNT = locations.filter(x => x.split(',')[7] === 'YES')
        let provincesOnlyJNT = provincesAvailableJNT.map(x => x.split(',')[4])
        provinces = [...new Set(provincesOnlyJNT)].sort()
        provinces.forEach(province => {
          resLocations[province] = {
            municipality_list: {}
          }
          let citiesJNT = provincesAvailableJNT.filter(x => x.split(',')[4] === province)
          let citiesOnlyJNT = citiesJNT.map(x => x.split(',')[5])
          cities = [...new Set(citiesOnlyJNT)]
          cities.forEach(city => {
            resLocations[province].municipality_list[city] = { barangay_list: [] }
            let brgysJNT = citiesJNT.filter(x => x.split(',')[5] === city)
            let brgysOnlyJNT = brgysJNT.map(x => x.split(',')[6])
            resLocations[province].municipality_list[city].barangay_list = brgysOnlyJNT
          })
        })
      }
      return res.status(200).json(resLocations)
    } catch(e) {
      writeLog('address', 'checkAddressToCourier', '00001', e.stack)
      return res.sendStatus(500)
    }
  }
}