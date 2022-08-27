const { Assumrs } = require('../../../../../model/DBModel')

const assumrDB = new Assumrs()

const totalOfAssumedANDPostedProperties = (req, res) => {
    assumrDB.userDashBoard(req.cookies, req.params)
        .then(response => {
            res.json(response)
        })
        .catch(err => {
            res.json(err)
        })
}

module.exports = { totalOfAssumedANDPostedProperties }