const fs = require('fs')

const modCity = (city) => {
  let res = city
  let param = city.match('CITY OF')
  if(param === null) {
    let temp = city.replace('CITY', '')
    res = temp
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
        selectedBrgy = []
    switch(type) {
      case 'flash':
        paramCity = modCity(city)
        locations.splice((locations.length - 1), 1)
        selectedProvince = locations.filter((x) => { return paramProvince.toUpperCase().match(x.split(',')[1].toUpperCase()) })
        selectedCity = selectedProvince.filter((x) => { return x.split(',')[2].toUpperCase().match(paramCity.trim()) })
        selectedBrgy = selectedCity.filter((x) => { return x.split(',')[3].toUpperCase() === paramBrgy.toUpperCase() })
        isAvailable = selectedBrgy[0].split(',')[7]
        break;
      case 'jnt':
        let pr = paramProvince.replace(' ', '-')
        paramCity = city.replace(/[ *]/g, '-')
        locations.splice((locations.length - 1), 1)
        selectedProvince = locations.filter((x) => { return pr.toUpperCase().match(x.split(',')[4].toUpperCase()) })
        selectedCity = selectedProvince.filter((x) => { return x.split(',')[5].toUpperCase().match(paramCity.toUpperCase().trim()) })
        selectedBrgy = selectedCity.filter((x) => { return x.split(',')[6].toUpperCase() === paramBrgy.toUpperCase() })
        isAvailable = selectedBrgy[0].split(',')[7]
        break;
    }
    return isAvailable

  } catch(e) {
    console.log(e)
    return 'error'

  }
  // return await fs.readFile(`${appRoot}/uploads/files/${type}.csv`, 'utf-8', (e, content) => {
  //   if(e) throw e
  //   // 7
  //   try {
  //     let isAvailable = 'NO',
  //       locations = content.split('\r\n'),
  //       paramProvince = province,
  //       paramCity = '',
  //       selectedProvince = [],
  //       selectedBrgy = []
  //     switch(type) {
  //       case 'flash':
  //         paramCity = modCity(city)
  //         locations.splice((locations.length - 1), 1)
  //         selectedProvince = locations.filter((x) => { return paramProvince.match(x.split(',')[1].toUpperCase()) })
  //         selectedCity = selectedProvince.filter((x) => { return x.split(',')[2].toUpperCase().match(paramCity.trim()) })
  //         selectedBrgy = selectedCity.filter((x) => { return x.split(',')[3].toUpperCase() === brgy })
  //         isAvailable = selectedBrgy[0].split(',')[7]
  //         break;
  //       case 'jnt':
  //         let province = province.replace(' ', '-')
  //         paramCity = city.replace(/[ *]/g, '-')
  //         console.log(paramCity)
  //         locations.splice((locations.length - 1), 1)
  //         selectedProvince = locations.filter((x) => { return paramProvince.match(x.split(',')[4].toUpperCase()) })
  //         selectedCity = selectedProvince.filter((x) => { return x.split(',')[5].toUpperCase().match(paramCity.trim()) })
  //         selectedBrgy = selectedCity.filter((x) => { return brgy.match(x.split(',')[6].toUpperCase()) })
  //         isAvailable = selectedBrgy[0].split(',')[7]
  //         break;
  //     }
  //     return isAvailable
  //   } catch(e) {
  //     console.log(e)
  //     return 'error'
  //   }
  // })
}