import {io} from "socket.io-client"

const joinRoomButton = document.getElementById("room-button")
const messageInput = document.getElementById("message-input")
const roomInput = document.getElementById("room-input")
const form = document.getElementById("form")

// To tell what is the url of server
const socket = io('http://localhost:3000')

// Access to user namespace, with auth token
const userSocket = io('http://localhost:3000/user', {auth:{token: 'Test'}})

// Connect event will run whenever client connects to our server
socket.on('connect', ()=>{
    displayMessage(`You have connected with id: # ${socket.id}`)
})

socket.on('receive-message', message => {
    displayMessage(message)
})


form.addEventListener("submit", e=>{
    e.preventDefault()
    const message = messageInput.value
    const room = roomInput.value

    if (message == "") return
    displayMessage(message)
    //We can name the event and send it up to the server
    socket.emit('send-message', message, room)

    messageInput.value=""
})

joinRoomButton.addEventListener("click", () => {
    const room = roomInput.value
    // Joining the room
    socket.emit('join-room', room, message => {
        displayMessage(message)
    })
})

function displayMessage(message){
    const div = document.createElement("div")
    div.textContent = message
    console.log(message)
    document.getElementById("message-container").append(div)
}

let count = 0

setInterval(() => {
    // If the message can't be send, ignore completely
    socket.volatile.emit('ping', ++count)
}, 1000)

document.addEventListener('keydown', e=>{
    console.log(e.key)
    if(e.target.matches('input')) return
    if(e.key === 'c') socket.connect()
    if(e.key === 'd') socket.disconnect()
})