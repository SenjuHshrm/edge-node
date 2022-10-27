const fs = require('fs')

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

module.exports = (province, city, brgy, type) => {
  try {
    let content = fs.readFileSync(`${appRoot}/uploads/files/${type}.csv`, 'utf-8'),
        isAvailable = 'NO',
        locations = content.split('\r\n'),
        paramProvince = province,
        paramCity = '',
        paramBrgy = brgy,
        selectedProvince = [],
        selectedBrgy = [];

    switch(type) {
      case 'flash':
        paramCity = modCity(city)
        locations.splice((locations.length - 1), 1)
        selectedProvince = locations.filter((x) => { return x.split(',')[1].toUpperCase().match(new RegExp(`${paramProvince}`)) })
        selectedCity = selectedProvince.filter((x) => { return x.split(',')[2].toUpperCase().match(new RegExp(`${paramCity}`)) })
        selectedBrgy = selectedCity.filter((x) => { return x.split(',')[3].toUpperCase() === paramBrgy })
        isAvailable = selectedBrgy[0].split(',')[7]
        
        break;
      case 'jnt':
        let pr = paramProvince.replace(' ', '-')
        paramCity = city.replace(/[ *]/g, '-')
        locations.splice((locations.length - 1), 1)
        selectedProvince = locations.filter((x) => { return x.split(',')[4].toUpperCase().match(new RegExp(`${pr}`)) })
        selectedCity = selectedProvince.filter((x) => { return x.split(',')[5].toUpperCase().match(new RegExp(`${paramCity}`)) })
        selectedBrgy = selectedCity.filter((x) => { return x.split(',')[6].toUpperCase() === paramBrgy })
        isAvailable = selectedBrgy[0].split(',')[7]
        break;
    }
    return isAvailable

  } catch(e) {
    console.log(e)
    return 'error'

  }
}