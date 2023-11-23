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

io.on('connection', async (socket) => {
  try {
    const { authorization } = socket.handshake.headers

    if (!authorization) {
      throw new Error('User not authenticated')
    }

    const user = await jwt.verify(authorization, process.env.SECRET_KEY)

    let roomName

    if (user.id) {
      let clientId = socket.handshake.headers['client-id']
      roomName = `chat-${user.id}-${clientId}`
    } else if (user.clientId) {
      let userId = socket.handshake.headers['user-id']
      roomName = `chat-${userId}-${user.clientId}`
    } else {
      throw new Error('Invalid user data')
    }

    console.log(roomName)

    socket.on(roomName, (data) => {
      socket.broadcast.emit(roomName, data)
    })

  } catch (error) {
    console.error(`Socket error: ${error.message}`)
    socket.disconnect(true)
  }
})