const jwt = require('jsonwebtoken')
const { Assumrs } = require('../../../../../model/DBModel')

const assumrDB = new Assumrs()

const userRecentChats = (req, res) => {
    const auth = req.headers.authorization.split(' ')[1]
    
    assumrDB.getuserRecentChats(auth)
        .then(response => {
            res.json(response)
        })
        .catch(err => {
            res.json(err)
        })
} // active user recently chats with

const userSendMessage = (req, res) => {

}

const userWantToChatWith = (req, res) => {
    assumrDB.iWantToChatWith(req.params)
        .then(response => {
            res.json(response)
        })
        .catch(err => {
            res.json(err)
        })
}

const userSendMessageThroughProperties = async (req, res) => {
    const token = req.headers.authorization.split(' ')[1]

    const verified = await new Promise((resolve, reject) => {
        jwt.verify(token, process.env.PUBLIC_TOKEN, (err, decoded) => {
            if(err)
                reject(err)
            resolve(decoded)
        })
    })
    
    if(!verified)
        return res.sendStatus(401)

    req.body = {...req.body, verified}

    assumrDB.userSendMessageThroughProperties(req.body)
        .then(response => {
            res.json(response)
        })
        .catch(err => {
            res.json(err)
        })  // the user send messages through posted-properties / properties that are ready for assumption
}

module.exports = { userRecentChats, userSendMessage, userWantToChatWith, userSendMessageThroughProperties }