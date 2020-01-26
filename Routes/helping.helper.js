/**
 * Created by Saleh on 07/02/2019.
 */
'use strict'

const config = require('../config/environment.config')
const jwt = require('jsonwebtoken')

let newConfig = {
  jwtOptions: {
    'secretOrKey': config.jwtOptions.secretOrKey || process.env.secretOrKey,
    'ignoreExpiration': config.jwtOptions.ignoreExpiration || process.env.ignoreExpiration
  }
}

// sign jwt token
const signLoginData = (userInfo) => {
  return new Promise((resolve, reject) => {
    console.log('Signing Token Now!!!!!! with key ',newConfig.jwtOptions.secretOrKey)
    var token = jwt.sign(userInfo, newConfig.jwtOptions.secretOrKey, { expiresIn: 180000000 })
    console.log('Token ==========>',token)
    return resolve(token)
  })
}



module.exports.signLoginData = signLoginData
