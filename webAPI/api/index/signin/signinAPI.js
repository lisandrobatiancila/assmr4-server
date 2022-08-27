const express = require('express')
const signinController = require('../../../controller/index/signin/signinController')

const router = express.Router()

router.route('/signin-user')
    .post(signinController.signinController)

module.exports = router