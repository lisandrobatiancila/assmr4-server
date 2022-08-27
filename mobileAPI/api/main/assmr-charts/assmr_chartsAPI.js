const express = require('express')
const router = express.Router()
const assmrChartAPI = require('../../../controller/main/assmr-charts/assmr_chartsController')


router.route('/assmr-properties-data-dashboard-chart/:email')
    .get(assmrChartAPI.assmrPropertiesDashboardChart)

module.exports = router