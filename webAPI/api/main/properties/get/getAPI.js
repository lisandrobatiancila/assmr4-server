const express = require('express')
const router = express.Router()
const propertiesController = require('../../../../controller/main/properties/get/getController')

router.route('/retrieve/:retrieveType')
    .get(propertiesController.getRandomProperties)

router.route('/property-for-assumption/:propertyType/:other_info')
    .get(propertiesController.propertyForAssumption)

router.route('/certain-property/:propertyType/:propertyID')
    .get(propertiesController.certainProperties)

module.exports = router