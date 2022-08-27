const express = require('express')
const router = express.Router()
const toAssumeController = require('../../../../controller/main/properties/get/getPropertiesController')

router.route('/vehicle-properties')
    .get(toAssumeController.vehicleProperties)

router.route('/jewelry-properties')
    .get(toAssumeController.jewelryProperties)
    
router.route('/certain-property/:propertyType/:propertyID')
    .get(toAssumeController.getCertainProperty)

module.exports = router