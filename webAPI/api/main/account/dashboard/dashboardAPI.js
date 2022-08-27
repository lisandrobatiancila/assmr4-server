const express = require('express')
const router = express.Router()
const dashboardController = require('../../../../controller/main/account/dashboard/dashboardController')

router.route('/total-of-assumed-and-posted-properties/:request_type')
    .get(dashboardController.totalOfAssumedANDPostedProperties)

module.exports = router