const express = require('express')
const signupController = require('../../../controller/index/signup/signupController')

const router = express.Router()

router.route('/register-user')
    .post(signupController.registerUser)

module.exports = router