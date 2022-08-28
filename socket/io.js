const User = require('../models/User')
const NotificationCount = require('../models/NotificationCount')


module.exports = (io) => {
  io.on('connection', (socket) => {
    
    /**
     * connect user
     */
    socket.on('join', (data) => {
      socket.username = data.id
      socket.join('edge')
      console.log(`User ${data.id} joined room "edge"`)
    })

    



  })
}