'use strict'

var sha1 = require('sha1')
var qiniu = require('qiniu')
var config = require('../../config/config')

var accessKey = config.qiniu.AK
var secretKey = config.qiniu.SK
var mac = new qiniu.auth.digest.Mac(accessKey, secretKey)
var bucket = 'vcandoudemo'


function uptoken(bucket,key){
  var options = {
    scope: bucket + ":" + key,
    //callbackUrl: 'http://api.example.com/qiniu/upload/callback',
    //callbackBody: 'key=$(key)&hash=$(etag)&bucket=$(bucket)&fsize=$(fsize)&name=$(x:name)'
  }
  var putPolicy = new qiniu.rs.PutPolicy(options)
  var uploadToken=putPolicy.uploadToken(mac)
  return uploadToken
}

exports.getQiniuToken = function(key){
  var token = uptoken(bucket,key)
  return token
}

exports.getCloudinaryToken = function(body){
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

  var signature = 'folder='+folder+'&tags='+tags+'&timestamp='+timestamp+config.cloudinary.api_secret
  signature=sha1(signature)
  return signature
}
