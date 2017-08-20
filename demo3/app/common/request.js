'use strict'

var queryString = require('query-string')
var _ = require('lodash')
var Mock = require('mockjs')
var request={}
var config = require('./config')

request.get = function(url,params){
    if(params){
        params.access_token=config.access_token;
        if(url.indexOf('?')>-1){
            url+='&'+queryString.stringify(params)
        }else{
            url+='?'+queryString.stringify(params)
        }
    }else{
        params={
            access_token:config.access_token
        }
    }
    return fetch(url)
            .then((response)=>response.json())
            .then((response)=>Mock.mock(response))
}

request.post = function(url,body){
    body.access_token=config.access_token;
    var options = _.extend(config.header,{
        body:JSON.stringify(body)
    })
    console.log(url);
    return fetch(url,options)
        .then((response)=>response.json())
        .then((response)=>Mock.mock(response))

}

module.exports = request