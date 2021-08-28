const {instrument} = require('@socket.io/admin-ui')

// The optional param is to whitelist for preventing CORS
const io = require('socket.io')(3000, {
    cors: {
        origin: ['http://localhost:8080', 'https://admin.socket.io/#/']
    }
})

// This is to connect to user namespace
const userIo = io.of('/user')
userIo.on('connection', socket => {
    console.log('Connected to user namespace with username ' + socket.username)
})

// To connect to middleware
userIo.use((socket, next) => {
    // If we do have a token
    if(socket.handshake.auth.token)
    {
        socket.username = getUsernameFromToken(socket.handshake.auth.token)
        next()
    }
    else
    {
        next(new Error('Please send token.'))
    }
})

function getUsernameFromToken(token)
{
    // You can perform setting it to database (or Whatever)
    return token
}

io.on('connection', socket => {
    console.log(socket.id)
    // To listen to the event where client is sending over
    socket.on('send-message', (message, room) => {
        // If room equals to empty, we are gonna broadcast the message
        if(room == '')
        {
            // So that this message will not be emitted to the sender (send to all others except this socket connection)
            socket.broadcast.emit('receive-message', message)
        }
        else
        {
            // It sends the message to everyone (auto-broadcast) in the room except yourself
            socket.to(room).emit('receive-message', message)
        }
    })

    // Call back should always be the last thing that you pass in
    socket.on('join-room', (room, cb) => {
        socket.join(room)
        cb(`Joined ${room}`)
    })

    socket.on('ping', n => console.log(n))
})

instrument(io, {auth: false})