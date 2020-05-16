'use strict'

const passport = require('passport')
const config = require('./environment.config')
const passportJWT = require('passport-jwt')
const User = require('../Models/UserCredential')
// Handling passport strategy
let ExtractJwt = passportJWT.ExtractJwt
let JwtStrategy = passportJWT.Strategy

let newConfig = {
  jwtOptions: {
    'secretOrKey': process.env.secretOrKey || config.jwtOptions.secretOrKey,
    'ignoreExpiration': process.env.ignoreExpiration || config.jwtOptions.ignoreExpiration,
    'passReqToCallback': process.env.passReqToCallback || config.jwtOptions.passReqToCallback
  }
}
newConfig.jwtOptions.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken()

var strategy = new JwtStrategy(newConfig.jwtOptions, (req, jwtPayload, next) => {
    console.log('In Strategy')
    console.log(jwtPayload)
    
  if (!jwtPayload) {
    next(null, false)
    return
  }
  jwtPayload = jwtPayload
 
  console.log(jwtPayload.email)
  User.findOne({
    email: jwtPayload.email
  })
    .then(user => {
        console.log(user)
      if (!user) {
        console.log('Calling Next in User Error')
        next(null, false)
      }else{
      console.log('Calling Next from correct user')
      next(null,jwtPayload)
    }
    })
    .catch(err => {
      console.log(err)
      next(null, false)
    })
})

passport.use(strategy)

module.exports = passport
