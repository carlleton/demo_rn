'use strict'

var base='http://rap.taobao.org/mockjs/24703/';
var config = {
    header:{
        method: 'POST',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
        },
    },
    api:{
        list:base+'api/list',//获取视频列表
        up:base+'api/up',//点赞功能
        comment:base+'api/comment',//获取和发生评论
        signup:base+'api/u/signup',//发送验证码
        verify:base+'api/u/verify',//验证登录
        signature:base+'api/signature',//请求模块
    },
    access_token:'asdffc'
}
module.exports = config;