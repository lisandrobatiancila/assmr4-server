const express = require('express')
const router = express.Router()
const postedPropertiesController = require('../../../../controller/main/properties/post/postedPropertiesController')

router.route('/total-posted-assumed-properties/:email')
    .get(postedPropertiesController.userTotalPosted_AssumedProperties)

router.route('/user-upload-vehicle-properties')
    .post(postedPropertiesController.userUploadVehicleProperties)

router.route('/user-upload-jewelry-properties')
    .post(postedPropertiesController.userUploadJewelryProperties)

router.route('/user-upload-realestate-properties')
    .post(postedPropertiesController.userUploadRealestateProperties)

router.route('/retrieve-posted-properties/:propertyType/:email')
    .get(postedPropertiesController.retrievePostedProperties) //get all user posted properties
    
router.route('/retrieve-certain-realestate/:realestateType/:email')
    .get(postedPropertiesController.retrieveCertainRealestateType) // get all realestateType for ex: [all house] only , [all house and lot] only,  and [all lot] only

router.route('/certain-posted-properties/:propertyID/:propertyType')
    .get(postedPropertiesController.certainPostedProperties)

router.route('/to-update-posted-properties/:propertyID')
    .get(postedPropertiesController.toUpdateCertainPostedProperties) //retrieve certain properties for update

router.route('/update-posted-properties')
    .put(postedPropertiesController.updateCertainPostedProperties) //this update properties info

router.route('/drop-certain-posted-properties')
    .patch(postedPropertiesController.dropCertainPostedProperties)

module.exports = router