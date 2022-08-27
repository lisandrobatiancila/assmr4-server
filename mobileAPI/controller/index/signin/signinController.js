const jwt = require('jsonwebtoken')
const { MobileUsers } = require('../../../../model/DMMobileModel')

const mobileUserDB = new MobileUsers()

const signinUser = (req, res) => {
    const { username, password } = req.body
    
    mobileUserDB.signinUser(req.body)
        .then(response => {
            const refreshToken = response.refreshToken
            res.cookie('userRefToken', refreshToken, {
                maxAge: 24*60*60*1000, httpOnly: true
            })

            res.json(response)
        })
        .catch(err => {
            // invalid credentials
            res.json(err)
        })
}

module.exports = { signinUser }