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

      socket.on(`chat`, (data) => {

        const clientId = socket.handshake.headers['client-id']

        const roomName = `chat-${user.id}-${clientId}`

        console.log(roomName)

        //io.sockets.emit(roomName, data)

        socket.broadcast.emit(roomName, data)
      });

      socket.on('disconnect', () => {
        console.log(`User disconnected: ${user.id}`)
      });
      return
    }

    if (user.clientId) {

      socket.on(`chat`, (data) => {

        const userId = socket.handshake.headers['user-id']

        const roomName = `chat-${userId}-${user.clientId}`

        console.log(roomName)

        //io.sockets.emit(roomName, data)

        socket.broadcast.emit(roomName, data)
      });

      socket.on('disconnect', () => {
        console.log(`Client disconnected: ${user.clientId}`)
      });
      return
    }

  } catch (error) {
    console.error(`Socket error: ${error.message}`)
    socket.disconnect(true)
  }
})
