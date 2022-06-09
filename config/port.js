module.exports = () => {
  let port = 0
  switch(process.env.NODE_ENV) {
    case 'development':
      port = process.env.PORT || 3000
      break;
    case 'test':
      port = 4000
      break
    default:
      port = 5000
  }
  return port
}