const { MobileUsers } = require('../../../../model/DMMobileModel')
const jwt = require('jsonwebtoken')

const mobileUser = new MobileUsers()

const userFeedBacks = async (req, res) => {
    const bearerToken = req.headers.authorization.split(' ')[1]
    const is_authValid = await new Promise((resolve, reject) => {
        jwt.verify(bearerToken, process.env.PUBLIC_TOKEN, (err, decoded) => {
            if(err)
                resolve({message: 'Expired token', has_error: true})
            resolve({message: 'passed', has_error: false})
        })
    })
        
    if (is_authValid.has_error)
        return res.json(is_authValid)

    mobileUser.userFeedBacks(req.body)
        .then(response => {
            res.json(response)
        })
        .catch(err => {
            res.json(err)
        })
}

const getUserFeedBacks = (req, res) => {
    mobileUser.getUserFeedBacks()
        .then(response => {
            res.json(response)
        })
        .catch(err => {
            res.json(err)
        })
}

module.exports = { userFeedBacks, getUserFeedBacks }