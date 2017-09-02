'use strict'

var mongoose = require('mongoose')
var xss = require('xss')
var User = mongoose.model('User')


exports.signup = async (ctx,next)=>{
  var phone = ctx.request.query.phone
  var user = await User.findOne({
    phone:phone
  }).exec()


  if(!user){
    user = new User({
      phone:xss(phone)
    })
  }else{
    user.verify = '1212'
  }

  try{
    user = await user.save()
    ctx.response.body={
      result:0
    }
  }catch(e){
    ctx.response.body={
      result:-1
    }
  }
  
}

exports.verify = async (ctx,next)=>{
    ctx.response.body={
        result:0
    }
}

exports.update = async (ctx,next)=>{
    ctx.response.body={
        result:0
    }
}