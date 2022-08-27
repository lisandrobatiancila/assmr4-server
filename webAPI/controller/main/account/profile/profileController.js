const { Assumrs } = require('../../../../../model/DBModel')

const assumrDB = new Assumrs()

const userProfile = (req, res) => {
    const cookies = req.cookies

    assumrDB.getProfile(cookies)
        .then(response => {
            res.json(response)
        })
        .catch(err => {
            res.json(err)
        })
}

module.exports = { userProfile }