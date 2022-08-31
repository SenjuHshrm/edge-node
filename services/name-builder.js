/**
 * Full name builder
 * @param {*} user - User schema object
 * @returns String
 */
module.exports = (user) => {
  if(user.middleName === '') {
    if(user.extName === '') {
      return `${user.firstName} ${user.lastName}`
    } else {
      return `${user.firstName} ${user.lastName}, ${user.extName}`
    }
  } else {
    if(user.extName === '') {
      return `${user.firstName} ${user.middleName.charAt(0)}. ${user.lastName}`
    } else {
      return `${user.firstName} ${user.middleName.charAt(0)}. ${user.lastName}, ${user.extName}`
    }
  }
}