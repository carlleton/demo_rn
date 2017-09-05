'use strict'

var mongoose = require('mongoose')
var User = mongoose.model('User')
var config = require('../../config/config')
var Video = mongoose.model('video')
var robot = require('../service/robot')

exports.video = async (ctx,next)=>{
  var body = ctx.request.body
  var videoData = boxy.video
  var user = ctx.session.user

  if(!videoData || !videoData.key){
    ctx.body = {
      result:-1,
      msg:'视频没有上传成功'
    }
    return next()
  }
  var video = await Video.findOne({
    qiniu_key:
  }).exec()

  if(!video){
    video = new Video({
      author:user._id,
      qiniu_key:videoData.key,
      persistentId:videoData.persistentId
    })

    video = await video.save()
  }

  var url = config.qiniu.video + video.qiniu_key

  robot
    .uploadToCloudinary(url)
    .then((data)=>{
      if(data && data.public_id){
        video.public_id = data.public_id
        video.detail = data
        video.save()
      }
    })

  this.body={
    result:0,
    data:video._id
  }
}