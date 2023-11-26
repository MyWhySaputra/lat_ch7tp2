const express = require('express')
const router = express.Router()
const { Create, Login, LoginClient, userStatus } = require('../controller/auth.controller')

router.post('/auth/create', Create)

router.post('/auth/login', Login)

router.post('/auth/login-client', LoginClient)

router.get('/user-status', userStatus)

module.exports = router