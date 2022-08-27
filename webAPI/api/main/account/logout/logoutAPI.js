const express = require('express')
const router = express.Router()
const logoutController = require('../../../../controller/main/account/logout/logoutController')

router.route('/user-logout')
    .get(logoutController.logoutUser)

module.exports = router