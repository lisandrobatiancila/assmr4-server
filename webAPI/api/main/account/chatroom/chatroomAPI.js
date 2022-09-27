const express = require('express')
const router = express.Router()
const chatroomController = require('../../../../controller/main/account/chatroom/chatroomController')

router.route('/user-recents-chats')
    .get(chatroomController.userRecentChats)

router.route('/user-send-message')
    .post(chatroomController.userSendMessage)

router.route('/user-want-to-chat-with/:sender_id/:receiver_id')
    .get(chatroomController.userWantToChatWith)

router.route('/user-send-message-through-properties')
    .post(chatroomController.userSendMessageThroughProperties)  // the user send messages through posted-properties / properties that are ready for assumption

module.exports = router