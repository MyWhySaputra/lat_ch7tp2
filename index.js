require('dotenv').config()
const express = require('express')
const router = require('./routes/routes')
const app = express()
const http = require('http').Server(app)
const io = require('socket.io')(http)
const jwt = require('jsonwebtoken')
const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

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
      let clientEmail = socket.handshake.headers['client-email']
      const clientid = await prisma.user.findUnique({
          where: {
              email: clientEmail
          }
      })
      roomName = `chat-${user.id}-${clientid.id}`
    } else if (user.clientId) {
      let userEmail = socket.handshake.headers['user-email']
      const userid = await prisma.user.findUnique({
          where: {
              email: userEmail
          }
      })
      roomName = `chat-${userid.id}-${user.clientId}`
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