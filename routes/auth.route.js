const express = require('express')
const router = express.Router()
const { Create, Login, LoginClient } = require('../controller/auth.controller')


router.post('/auth/create', Create)

router.post('/auth/login', Login)

router.post('/auth/login-client', LoginClient)

module.exports = router