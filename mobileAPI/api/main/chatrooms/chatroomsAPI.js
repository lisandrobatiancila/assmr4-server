const express = require('express')
const router = express.Router()
const userChatController = require('../../../controller/main/chatrooms/chatroomsController')

router.route('/user-send-message')
    .post(userChatController.userSendMessage)

router.route('/active-user-retreive-message/:email')
    .get(userChatController.activeUserRetrieveMessages)

router.route('/user-open-chatroom/:senderID/:receiverID')
    .get(userChatController.userOpenChatsWithUser)

module.exports = router