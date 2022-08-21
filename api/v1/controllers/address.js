const fs = require('fs')

module.exports = {
  /**
   * 
   */
  checkAddressToCourier: (req, res) => {
    fs.readFile(`${appRoot}/uploads/files/${req.params.type}.csv`, 'utf-8', (e, content) => {
      if(e) throw e
      // 7
      let isAvailable = 'NO';
      for(let row of content.split('\n')) {
        const item = row.split(',')
        if(req.params.province === item[1].toUpperCase() &&
            req.params.city === item[2].toUpperCase() &&
            req.params.brgy === item[3].toUpperCase()) {
          isAvailable = item[7];
          break;
        }
      }
      return res.status(200).json({ success: true, info: isAvailable })
    })
  }
}