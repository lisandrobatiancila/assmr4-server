const express = require('express')
const router = express.Router()
const refreshController = require('../../controller/main/refresh/refreshController')

router.route('/refresh-token')
    .get(refreshController.refreshToken)  // it will only remake a new accessToken

module.exports = router