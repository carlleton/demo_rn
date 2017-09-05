'use strict'

var sha1 = require('sha1')
var qiniu = require('qiniu')
var cloudinary = require('cloudinary')
var Promise = require('bluebird')
var uuid = require('uuid')
var config = require('../../config/config')

var accessKey = config.qiniu.AK
var secretKey = config.qiniu.SK
var mac = new qiniu.auth.digest.Mac(accessKey, secretKey)

cloudinary.config(config.cloudinary)

exports.getQiniuToken = function(body){
  var type = body.type
  var key = uuid.v4()
  var putPolicy
  var options={
    persistentNotifyUrl:config.notify
  }

  if(type=='avatar'){
    key+='.png'
    //callbackUrl: 'http://api.example.com/qiniu/upload/callback',
    //callbackBody: 'key=$(key)&hash=$(etag)&bucket=$(bucket)&fsize=$(fsize)&name=$(x:name)'
    putPolicy = new qiniu.rs.PutPolicy({scope: "vcandoudemo:" + key})
  }else if(type=='video'){
    key+='.mp4'
    options.scope = 'vcandoudemovideo:'+key
    options.persistentOps = 'avthumb/mp4/an/1'
    //options.persistentPipeline="video-pipe"
    putPolicy = new qiniu.rs.PutPolicy(options)
  }else if(type=='audio'){
    key+='.mp3'
  }

  var token = putPolicy.uploadToken(mac)
  return {
    token:token,
    key:key
  }
}

exports.uploadToCloudinary = function(url){

  return new Promise((resolve,reject)=>{
    cloudinary.uploader.upload(url,(result)=>{
      if(result.public_id){
        resolve(result)
      }else{
        reject(result)
      }
    },{
      resource_type:'video',
      folder:'video'
    })
  })
}

exports.getCloudinaryToken = function(body){
  var type = body.type
  var timestamp = body.timestamp
  var type = body.type
  var folder
  var tags
  var key = uuid.v4()
  if(type=='video'){
    key+='.mp4'
  }else if(type=='avatar'){
    key+='.png'
  }

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

  var signature = 'folder='+folder+'&tags='+tags+'&timestamp='+timestamp+config.cloudinary.api_secret
  signature=sha1(signature)
  return {
    token:signature,
    key:key
  }
}
