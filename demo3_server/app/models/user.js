'use strict'

var mongoose = require('mongoose')

var UserSchema = new mongoose.Schema({
  phone:{
    unique:true,
    type:String
  },
  areaCode:String,
  verify:String,
  access_token:String,
  nickname:String,
  gender:String,
  age:String,
  avatar:String,
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

UserSchema.pre('save',function(next){
  if(this.isNew){
    this.meta.createTime = this.meta.updateTime = Date.now()
  }else{
    this.meta.updateTime = Date.now()
  }
  next()
})

module.exports = mongoose.model('User',UserSchema)
