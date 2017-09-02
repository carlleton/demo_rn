'use strict'

var mongoose = require('mongoose')
var xss = require('xss')
var User = mongoose.model('User')
var uuid = require('uuid')
var sms = require('../service/sms')


exports.signup = async (ctx,next)=>{
  var phone = xss(ctx.request.body.phone.trim())
  var user = await User.findOne({
    phone:phone
  }).exec()

  var verifycode = sms.getCode()

  if(!user){
    var access_token = uuid.v4()
    user = new User({
      nickname:'用户'+parseInt(Math.random()*1000),
      avatar:'',
      phone:xss(phone),
      verifycode:verifycode,
      access_token:access_token
    })
  }else{
    user.verifycode = verifycode
  }

  try{
    user = await user.save()
  }catch(e){
    ctx.body={
      result:-1
    }
    return
  }
  var msg = '您的注册验证码是：'+user.verifycode
  await sms.send(user.phone,msg)
    .then((data)=>{
      console.log(data)
      ctx.body={
        result:0
      }
    })
    .catch((e)=>{
      console.log(e)
      ctx.body={
        result:-1,
        msg:'短信服务异常'
      }
      return
    })
}

exports.verify = async (ctx,next)=>{
  var body = ctx.request.body
  var verifycode = xss(body.verifycode.trim())
  var phone = xss(body.phone.trim())

  if(!verifycode || !phone){
    ctx.body={
      result:-1,
      msg:'验证未通过'
    }
    console.log(verifycode+','+phone)
    return
  }

  var user = await User.findOne({
    phone:phone,
    verifycode:verifycode
  }).exec()

  if(user){
    user.verified = true
    user = await user.save()
    ctx.body = {
      result:0,
      msg:'ok',
      data:{
        nickname:user.nickname,
        access_token:user.access_token,
        avatar:user.avatar,
        _id:user._id
      }
    }
  }else{
    ctx.body={
      result:-1,
      msg:'验证未通过'
    }
  }
  
}

exports.update = async (ctx,next)=>{
  var body = ctx.request.body

  var user = ctx.session.user
  var fields = 'avatar,gender,age,nickname'.split(',')
  fields.forEach((field)=>{
    if(body[field]){
      user[field]=xss(body[field].trim())
    }
  })

  user = await user.save()
  ctx.body={
      result:0,
      data:{
        nickname:user.nickname,
        access_token:user.access_token,
        avatar:user.avatar,
        age:user.age,
        gender:user.gender,
        _id:user._id
      }
  }
}