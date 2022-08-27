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


module.exports = { userRecentChats, userSendMessage, userWantToChatWith }