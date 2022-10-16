const express = require('express')
const router = express.Router()
const updatePropertyController = require('../../../../controller/main/account/properties/updatePropertiesController')

router.route('/vehicle')
    .patch(updatePropertyController.updateVehicleProperties)

router.route('/drop-property')
    .delete(updatePropertyController.dropProperties)
    
module.exports = router

// THIS IS UNUSED RIGHT NOW FOR ALL FILE