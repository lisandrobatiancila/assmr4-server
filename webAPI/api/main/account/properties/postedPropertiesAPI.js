const express = require('express')
const router = express.Router()
const postedPropertiesController = require('../../../../controller/main/account/properties/postedPropertiesController');

router.route('/all-properties/:propertyType/:otherType')
    .get(postedPropertiesController.retrievePostedProperties)

router.route('/vehicle')
    .patch(postedPropertiesController.updateVehicleProperties)

router.route('/jewelry')
    .patch(postedPropertiesController.updateJewelryProperties)

router.route('/drop-property/:propertyID')
    .delete(postedPropertiesController.dropProperties)

module.exports = router