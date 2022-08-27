const express = require('express')
const router = express.Router()
const profileController = require('../../../../controller/main/account/profile/profileController')

router.route('/user-profile')
    .get(profileController.userProfile)

module.exports = router