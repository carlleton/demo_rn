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
        list:base+'api/list',
        up:base+'api/up',
    },
    access_token:'asdffc'
}
module.exports = config;