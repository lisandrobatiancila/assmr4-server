const express = require('express')
const router = express.Router()
const assumptionController = require('../../../controller/main/assumption/assumptionController'
)
router.route('/user-assumer-info')
    .post(assumptionController.assumerInfo)

router.route('/user-submit-assumption-form')
    .post(assumptionController.submitAssumptionForm)

router.route('/get-property-owner-info/:propertyID')
    .get(assumptionController.getPropertyOwnerInfo)

module.exports = router