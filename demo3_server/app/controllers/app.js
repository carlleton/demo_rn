'use strict'

var mongoose = require('mongoose')
var xss = require('xss')
var User = mongoose.model('User')
var uuid = require('uuid')

exports.signature = async (ctx,next)=>{
  ctx.response.body={
    result:0
  }
}

exports.hasBody = async (ctx,next)=>{
  var body = ctx.request.body||{}
  if(Object.keys(body).length===0){
    ctx.body={
      result:-1,
      msg:'是不是漏掉什么了'
    }
    return
  }
  console.log('hasBody')
  await next()
}
//是否存在token
exports.hasToken = async (ctx,next)=>{
  var access_token = ctx.request.query.access_token

  if(!access_token){
    access_token = ctx.request.body.access_token
  }
  if(!access_token){
    ctx.body={
        result:-1,
        msg:'钥匙丢了'
    }
    return
  }
  var user = await User.findOne({
    access_token:access_token
  }).exec()

  if(!user){
    ctx.body={
      result:-1,
      msg:'没有该用户'
    }
    return
  }

  ctx.session = ctx.session||{}
  ctx.session.user = user
  await next()
}