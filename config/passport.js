const passport = require('passport')
const LocalStrategy = require('passport-local').Strategy
const User = require('../api/v1/models/User')

passport.use('local', new LocalStrategy({
  usernameField: 'username',
  passwordField: 'password'
}, async (username, password, done) => {
  try {
    let user = await User.findOne({ username: username }).exec()
    if(!user) return done(null, false, { message: 'Username not registered' })
    if(!user.comparePasswords(password)) return done(null, false, { message: 'Password didn\'t match' })
    return done(null, user)
  } catch(e) {
    return done(e, null, { message: 'An error occured' })
  }
}))