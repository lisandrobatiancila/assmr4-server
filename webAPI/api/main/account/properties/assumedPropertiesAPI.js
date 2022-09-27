const express = require('express')
const router = express.Router()
const assumedPropertiesController = require('../../../../controller/main/account/properties/assumedPropertiesController')

router.route('/')
    .get(assumedPropertiesController.retrievedAssumedProperties)

module.exports = router