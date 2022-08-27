const express = require('express')
const router = express.Router()

const feedbacksController = require('../../../controller/main/feedbacks/feedbacksController')

router.route('/user-feedbacks-actions')
    .post(feedbacksController.userFeedBacks)

router.route('/get-user-feedbacks')
    .get(feedbacksController.getUserFeedBacks)

module.exports = router