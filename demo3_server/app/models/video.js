'use strict'

var mongoose = require('mongoose')
var Schema = mongoose.Schema
var ObjectId = Schema.Types.ObjectId
var Mixed = Schema.Types.Mixed

var VideoSchema = new Schema({
  author:{
    type:ObjectId,
    ref:'User'
  },
  qiniu_key:String,
  persistentId:String,
  qiniu_final_key:String,
  qiniu_detail:Mixed,

  public_id:String,
  detail:Mixed,

  meta:{
    createTime:{
      type:Date,
      default:Date.now()
    },
    updateTime:{
      type:Date,
      default:Date.now()
    }
  }
})

VideoSchema.pre('save',function(next){
  if(this.isNew){
    this.meta.createTime = this.meta.updateTime = Date.now()
  }else{
    this.meta.updateTime = Date.now()
  }
  next()
})

module.exports = mongoose.model('User',VideoSchema)
