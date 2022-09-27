const express = require('express')
const app = express()
const http = require('http')
require('dotenv').config()
const cors = require('cors')
const cookiesParser = require('cookie-parser')
const bodyParser = require('body-parser')

const header = require('./webAPI/middleware/cors/setHeader')
const allowedCors = require('./webAPI/middleware/cors/cors')
const allowedDomain = require('./webAPI/middleware/cors/allowedDomain')
const webAPI = require('./webAPI/webAPI')
const mobileAPI = require('./mobileAPI/mobileAPI')
const { Server } = require('socket.io')
const DataStore = require('nedb')

const PORT = 1000 || process.env.PORT

const server = http.createServer(app)
const io = new Server(server, {cors: {origin: allowedDomain}})

app.use(cookiesParser())

app.use(express.static('images')) //can be unused
app.use('/images', express.static("images"))

app.use(header)
app.use(cors(allowedCors))

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended: true}))


app.use('/webAPI', webAPI)
app.use('/mobileAPI', mobileAPI)

// for messages ONLY!!!
const messagesDS = new DataStore({filename: './database/messages.db'})
const accountDS = new DataStore({filename: './database/accounts.db'})
const userDS = new DataStore({filename: './database/users.db'})

io.on('connection', (socket) => {
    socket.on('recentChatsWith', async (user) => {
        const userID = await new Promise((resolve, reject) => {
            accountDS.loadDatabase()
            accountDS.findOne({email: user.email}, {user_id: 1}, function(err, accRec) {
                if(err)
                    reject(err)
                resolve(accRec)
            })
        })
        messagesDS.loadDatabase()
        messagesDS.find({
            $where: function() {
                return (this.sender_id === userID.user_id || this.receiver_id === userID.user_id) && this.current == 1
            }
        }, function(err, messRec) {
            socket.emit('recentChatsWith', messRec)
        })
    })//end of recentlyChatsWith

    socket.on('send-message', async (messagePayloads) => {
        const { message, receiverID, active_user } = messagePayloads

        const account_sender = await new Promise((resolve, reject) => {
            accountDS.loadDatabase()
            accountDS.findOne({email: active_user}, {user_id: 1}, function(err, accRec) {
                if(err)
                    reject(err)
                resolve(accRec)
            })
        })

        const user_sender = await new Promise((resolve, reject) => {
            userDS.loadDatabase()
            userDS.findOne({_id: account_sender.user_id}, {firstname: 1, middlename: 1, lastname: 1}, function(err, userRec) {
                if(err)
                    reject(err)
                resolve(userRec)
            })
        })
        
        const account_receiver = await new Promise((resolve, reject) => {
            accountDS.loadDatabase()
            accountDS.findOne({user_id: receiverID}, {email: 1}, function(err, accRec) {
                if(err)
                    reject(err)
                resolve(accRec)
            })
        })

        const user_receiver = await new Promise((resolve, reject) => {
            userDS.loadDatabase()
            userDS.findOne({_id: receiverID}, {firstname: 1, middlename: 1, lastname: 1}, function(err, userRec) {
                if(err)
                    reject(err)
                resolve(userRec)
            })
        })
        const currentMessage = await new Promise((resolve, reject) => {
            messagesDS.loadDatabase()
            messagesDS.findOne(
                {
                    $where: function() {
                        return (this.sender_id === account_sender.user_id && this.receiver_id === receiverID && this.current == 1)
                            || (this.sender_id === receiverID && this.receiverID === account_sender.user_id && this.current == 1)
                    }
                },
                function(err, messRec) {
                    if(err)
                        reject(err)
                    resolve(messRec)
                }
            )
        })
        messagesDS.loadDatabase()
        if(currentMessage)
            messagesDS.update({_id: currentMessage._id}, {$set: {current: 0}})
        messagesDS.loadDatabase()

        const date = new Date()
        const fullDate = `${date.getMonth()+1}/${date.getDate()}/${date.getFullYear()}`

        messagesDS.insert(
            {
                sender_email: active_user, sender_id: account_sender.user_id, message_sender: `${user_sender.lastname}, ${user_sender.firstname} ${user_sender.middlename}`,
                receiver_email: account_receiver.email, receiver_id: receiverID, message_receiver: `${user_receiver.lastname}, ${user_receiver.firstname} ${user_receiver.middlename}`,
                message, current: 1, date: fullDate, count: 7
            }
        )

        messagesDS.loadDatabase()
        const for_chatts_box = await new Promise((resolve, reject) => {
            messagesDS.loadDatabase()
            messagesDS.find(
                {
                    $where: function() {
                        return (this.sender_id === account_sender.user_id && this.receiver_id === receiverID)
                            || (this.sender_id === receiverID && this.receiver_id === account_sender.user_id)
                    }
                },
                function(err, messRec) {
                    if(err)
                        reject(err)
                    resolve(messRec)
                }
            )
        })
        const current_I_chatt_with = await new Promise((resolve, reject) => {
            messagesDS.loadDatabase()
            messagesDS.find(
                {
                    $where: function() {
                        return (this.sender_id === account_sender.user_id || this.receiver_id === account_sender.user_id) && this.current == 1
                    }
                }, function(err, messRec) {
                    if(err)
                        reject(err)
                    resolve(messRec)
                }
            )
        })

        socket.emit('send-message', ({for_chatts_box, current_I_chatt_with}))
        socket.emit('recentChatsWith', ({email: active_user}))
        // socket.emit('send-message', (user))
    })
})
// end for MESSAGES ONLY!!!

server.listen(PORT, () => {
    console.log(`Listening to port: ${PORT}`)
})