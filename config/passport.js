const passport = require('passport')
const LocalStrategy = require('passport-local').Strategy
const JwtStrategy = require('passport-jwt').Strategy
const ExtractJwt = require('passport-jwt').ExtractJwt
const User = require('../api/v1/models/User')

let jwtOptions = {
  secretOrKey: process.env.JWT_SECRET,
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken()
}

passport.use('local', new LocalStrategy({
  usernameField: 'username',
  passwordField: 'password'
}, async (username, password, done) => {
  try {
    let user = await User.findOne({ username: username }).exec()
    if(!user) { return done(null, false, { message: 'Username not registered' }) }
    if(!user.comparePasswords(password)) { return done(null, false, { message: 'Password didn\'t match' }) }
    return done(null, user)
  } catch(e) {
    return done(e, null, { message: 'An error occured' })
  }
}))

passport.use('jwt', new JwtStrategy(jwtOptions, (payload, done) => {
  User.findById(payload.sub)
    .then(user => {
      if(!user) { return done(null, false) }
      return done(null, user)
    })
    .catch(err => {
      return done(err, null)
    })
}))