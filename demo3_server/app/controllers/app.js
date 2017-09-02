'use strict'

var sha1 = require('sha1')
var mongoose = require('mongoose')
var xss = require('xss')
var User = mongoose.model('User')
var uuid = require('uuid')
var config = require('../../config/config')


exports.signature = async (ctx,next)=>{
  var body = ctx.request.body
  var timestamp = body.timestamp
  var type = body.type

  var folder
  var tags
  if(type === 'avatar'){
    folder = 'avatar'
    tags = 'app,avatar'
  }else if(type === 'video'){
    folder = 'video'
    tags = 'app,video'
  }else if(type === 'audio'){
    folder = 'audio'
    tags = 'app,audio'
  }

  var signature = 'folder='+folder+'&tags='+tags+'&timestamp='+timestamp+config.cloudinary.api_secret;
  signature=sha1(signature);

  ctx.response.body={
    result:0,
    data:signature
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