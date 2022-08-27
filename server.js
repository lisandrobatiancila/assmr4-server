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
})
// end for MESSAGES ONLY!!!

server.listen(PORT, () => {
    console.log(`Listening to port: ${PORT}`)
})