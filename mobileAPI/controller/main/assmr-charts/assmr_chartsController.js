const { MobileAssumrs } = require('../../../../model/DMMobileModel')

const mobileAssumers = new MobileAssumrs()

const assmrPropertiesDashboardChart = (req, res) => {
    mobileAssumers.assmrDashBoardChart(req.params)
        .then(response => {
            res.json(response)
        })
        .catch(err => {
            console.log(err)
            res.json(err)
        })
}

module.exports = { assmrPropertiesDashboardChart }