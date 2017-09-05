'use strict'

var Router = require('koa-router')
var User = require('../app/controllers/user')
var App = require('../app/controllers/app')
var List = require('../app/controllers/List')


module.exports = function(){
  var router = new Router({
      prefix:'/api'
  })

  //user
  router.post('/u/signup',App.hasBody,User.signup)
  router.post('/u/verify',App.hasBody,User.verify)
  router.post('/u/update',App.hasBody,App.hasToken,User.update)

  //
  router.get('/list',App.empty)
  router.post('/list/video',App.hasBody,App.hasToken,List.video)

  //app
  router.post('/signature',App.hasBody,App.hasToken,App.signature)
  return router
}