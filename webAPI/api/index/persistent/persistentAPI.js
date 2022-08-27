const express = require('express')
const router = express.Router()
const persistentController = require('../../../controller/index/persistent/persistentController')

router.route('/refresh-token')
    .get(persistentController.refreshToken)

module.exports = router