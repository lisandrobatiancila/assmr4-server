const express = require('express')
const router = express.Router()
const signupController = require('../../../controller/index/signup/signupController')

router.route('/signup')
    .post(signupController.signUp)

    
module.exports = router