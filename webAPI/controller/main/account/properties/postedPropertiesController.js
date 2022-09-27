const { Users } = require('../../../../../model/DBModel')
const jwt = require('jsonwebtoken')

const userDB = new Users()

const retrievePostedProperties = async (req, res) => {
    const authorization = req.headers.authorization.split(' ')[1]

    const verified = await new Promise((resolve, reject) => {
        jwt.verify(authorization, process.env.PUBLIC_TOKEN, (err, decoded) => {
            if(err)
                resolve({message: "something went wrong!", has_error: true})
            resolve({...decoded, has_error: false})
        })
    })

    if(verified?.has_error)
        return res.sendStatus(401)

    const { propertyType, otherType } = req.params
    // the otherType here means if [propertyType is realestates, and otherType means house, house and lot, lot] house by default
    const email = verified?.email

    userDB.retreievePostedProperties(email, propertyType, otherType)
        .then(response => {
            res.json(response)
        })
        .catch(err => {
            res.json(err)
        })
}  // all active user posted properties by type ['realestate', 'vehicle', 'jewelry'] by default it's "vehicle"

module.exports = { retrievePostedProperties }