// const express = require('express')
// const router = express.Router()
// const http = require('http').Server(router)
// const io = require('socket.io')(http)
// const { Auth } = require('../middleware/middleware')

// // io.on('connect', (socket)=>{
// //     console.log('user conected')
// //     socket.on('chat',(data)=>{
// //         io.sockets.emit('chat',data)
// //     })
// // })

// router.use('/', Auth, io.on('connect', (socket)=>{
//     console.log('user conected')
//     socket.on('chat',(data)=>{
//         io.sockets.emit('chat',data)
//     })
// }))

// module.exports = router