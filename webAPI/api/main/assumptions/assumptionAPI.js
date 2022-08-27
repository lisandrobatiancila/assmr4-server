const express = require('express')
const router = express.Router()
const assumptionController = require('../../../controller/main/assumptions/assumptionController')

router.route('/verify-if-assumer-is-owner/:propertyID')
    .get(assumptionController.verifyIfAssumerIsOwner)

router.route('/assumer-info/:email')
    .get(assumptionController.getAssumerInfo)

router.route('/user-submit-assumption-form')
    .post(assumptionController.userSubmitAssumptionForm)
    
// router.route('/assumer-send-message')
//     .post()
    
module.exports = router