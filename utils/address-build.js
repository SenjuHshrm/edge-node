module.exports = (addr) => {
  let res = [];
  Object.keys(addr).forEach(key => {
    if(addr[key] !== '') res.push(addr[key])
  })
  return res
}