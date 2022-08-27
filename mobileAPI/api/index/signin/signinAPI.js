const express = require('express')
const router = express.Router()
const signinController = require('../../../controller/index/signin/signinController')

router.route('/signin')
    .post(signinController.signinUser)

module.exports = router