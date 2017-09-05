'use strict'

var base='http://rap.taobao.org/mockjs/24703/'
base ='http://192.168.1.103:1234'
var config = {
    header:{
        method: 'POST',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
        },
    },
    api:{
        list:base+'/api/list',//获取视频列表
        up:base+'/api/up',//点赞功能
        comment:base+'/api/comment',//获取和发生评论
        signup:base+'/api/u/signup',//发送验证码
        verify:base+'/api/u/verify',//验证登录
        update:base+'/api/u/update',//更新用户数据
        signature:base+'/api/signature',//请求模块
        video:base+'/api/list/video',//上传视频
    },
    access_token:'',
    cloud:'qiniu',//qiniu||cloudinary
    qiniu:{
        upload:'http://upload.qiniu.com/',
        base:'http://ovovauhwv.bkt.clouddn.com',
    },
    cloudinary : {
      cloud_name: 'carlleton',  
      api_key: '637443679349469',
      base:'http://res.cloudinary.com/carlleton',
      image:'https://api.cloudinary.com/v1_1/carlleton/image/upload',
      video:'https://api.cloudinary.com/v1_1/carlleton/video/upload',
      audio:'https://api.cloudinary.com/v1_1/carlleton/raw/upload',
    }
}
module.exports = config