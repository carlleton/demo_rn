'use strict'
var koa = require('koa')
var logger = require('koa-logger')
var session = require('koa-session')
var bodyParser = require('koa-bodyparser')
var app = new koa()

app.keys=['vcandou']
app.use(logger())
app.use(session(app))
app.use(bodyParser())

var router = require('./config/routes')()

app
    .use(router.routes())
    .use(router.allowedMethods())

app.listen(1234)
console.log('listening on 1234')
