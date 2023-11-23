require('dotenv').config()
const express = require('express')
const router = require('./routes/routes')
const app = express()
const http = require('http').Server(app)
const io = require('socket.io')(http)
const jwt = require('jsonwebtoken')

app.use(express.json())
app.use(express.urlencoded({ extended: false }))

http.listen(3000, ()=>{
  console.log('listened on port 3000')
})

app.use('/', router)

// app.use('/', (req,res)=>{
//   res.sendFile(__dirname+'/index.html')
// })

// io.on('connect', (socket)=>{
//   console.log('user conected')
//   // let eventRoom = `chat-${req.user.id}-${clientId}`
//   // console.log(eventRoom)
//   socket.on('chat',(data)=>{
//     io.sockets.emit('chat',data)
//   })
// })

io.on('connection', async (socket) => {
  try {

    const { authorization } = socket.handshake.headers;
    // Jika pengguna belum terautentikasi, maka tolak koneksi
    if (!authorization) {
      throw new Error('User not authenticated')
    }

    // Lakukan verifikasi token untuk mendapatkan informasi pengguna
    const user = await jwt.verify(authorization, process.env.SECRET_KEY)

    if (user.id) {

      let clientId = socket.handshake.headers['client-id']
      let roomName = `chat-${user.id}-${clientId}`

      console.log(roomName)

      socket.on(roomName, (data) => {

        //io.sockets.emit(roomName, data)
        socket.broadcast.emit(roomName, data)
      })
      return
    }

    if (user.clientId) {

      let userId = socket.handshake.headers['user-id']
      let roomName = `chat-${userId}-${user.clientId}`

      console.log(roomName)

      socket.on(roomName, (data) => {

        //io.sockets.emit(roomName, data)
        socket.broadcast.emit(roomName, data)
      })
      return
    }

  } catch (error) {
    console.error(`Socket error: ${error.message}`)
    socket.disconnect(true)
  }
})
