require('dotenv').config()

const express = require('express')
const cors = require('cors')
const morgan = require('morgan')
const passport = require('passport')
const path = require('path')
const { createServer } = require('http')
const { Server } = require('socket.io')
const app = express()
const { corsConfig, db, port } = require('./config')
const { v1GETRoutes, v1POSTRoutes, v1PUTRoutes, v1DELETERoutes } = require('./api/v1/routes')

// Socket.IO intialization
const http = createServer(app)
const io = new Server(http, {
  cors: {
    origin: process.env.CORS_ORIGIN.split(' ')
  }
})


// Server setup
app
  .set('port', port())
  .use(cors(corsConfig))
  .use(express.json({ limit: '100gb' }))
  .use(express.urlencoded({ extended: true }))
  .use(morgan('dev'))
  .use(passport.initialize())
  .use(express.static(path.join(__dirname, 'uploads')))
  .use(express.static(path.join(__dirname, 'app')))
  .use(express.static(path.join(__dirname, 'temp')))


global.appRoot = path.resolve(__dirname)
global.io = io

require('./config/passport')
require('./socket/io')(io)

// Route Setup for v1
app.use('/api/v1/get/', v1GETRoutes)
app.use('/api/v1/post/', v1POSTRoutes)
app.use('/api/v1/put/', v1PUTRoutes)
app.use('/api/v1/delete/', v1DELETERoutes)

app.get('/*', (req, res) => {
  res.sendFile(__dirname + '/app/index.html')
})

// Listener
http.listen(app.get('port'), () => {
  console.log(`App running on port ${app.get('port')} in ${process.env.NODE_ENV} mode.`)
  db()
})

module.exports = app