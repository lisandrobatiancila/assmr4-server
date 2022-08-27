const { MobileUsers, MobileAssumrs } = require('../../../../model/DMMobileModel')

const mobileUserDB = new MobileUsers()
const assumrDB = new MobileAssumrs()

const userSendMessage = (req, res) => {
    mobileUserDB.userSendMessage(req.body)
        .then(response => {
            res.json(response)
        })
        .catch(err => {
            res.json(err)
        })
}// user send a message through assumption form

const activeUserRetrieveMessages = (req, res) => {
    assumrDB.activeUserRetrieveMessages(req.params)
        .then(response => {
            res.json(response)
        })
        .catch(err => {
            res.json(err)
        })
}

const userOpenChatsWithUser = (req, res) => {
    assumrDB.userOpenChatsWithUser(req.params)
        .then(response => {
            res.json(response)
        })
        .catch(err => {
            res.json(err)
        })
}

module.exports = { userSendMessage, activeUserRetrieveMessages, userOpenChatsWithUser }