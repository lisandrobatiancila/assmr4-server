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

const updateVehicleProperties = (req, res) => {
    const cookies = req.cookies

    if(!cookies)
        return res.sendStatus(401)
    
    const bearerToken = req.headers.authorization.split(' ')[1]
    // console.log(bearerToken)
    const verify = jwt.verify(bearerToken, process.env.PUBLIC_TOKEN, (err, decoded) => {
        if(err)
            return false; // means error
        return decoded
    })

    if(!verify)
        return res.sendStatus(401)

    const payloads = req.body
    var error_found = null
    const payloadLen = payloads.payloads.length

    for(let i = 0; i < payloadLen; i++) {
        if(payloads.payloads[i].isChanged && !/[^\s]/.test(payloads.payloads[i].key)){
            payloads.payloads[i].field = i == 0?'empty owner':i == 1?'empty contact':i == 2?'empty location':
                i == 3?'empty name': i== 4?'empty model':i==5?'empty installmentpaid':
                i == 6?'empty installmentduration':i == 7?'empty delinquent':i == 8?'empty description':'pass'
            payloads.payloads[i].has_error = true // has_error is important
            error_found = payloads.payloads[i]
            break
        }
    }
    
    if(error_found)
        return res.json(error_found)
    
    if(payloads.payloads.filter(payload => payload.isChanged).length > 0){
        payloads.payloads = payloads.payloads.filter(payload => payload.isChanged)
        userDB.updateProperty(payloads)
            .then(response => {
                res.json(response)
            })
            .catch(err => res.json(err))
    }
    else
        return res.json({message: 'There is nothing to update.', has_error: false})
}

const updateJewelryProperties = (req, res) => {
    const cookies = req.cookies

    if(!cookies)
        return res.sendStatus(401)

    const bearerToken = req.headers.authorization.split(' ')[1];

    const verify = jwt.verify(bearerToken, process.env.PUBLIC_TOKEN, (err, decoded) => {
        if(err)
            return false; // means error
        return decoded;
    })

    if(!verify)
        return res.sendStatus(401)

    const payloads = req.body
    if(payloads.payloads.filter(payload => payload.isChanged).length == 0)
        return res.json({message: 'There is nothing to update', has_error: false})
    
    var error_found = null
    const payloadLen = payloads.payloads.length
    for(let i = 0; i < payloadLen; i++) {
        if(payloads.payloads[i].isChanged && !/[^\s]/.test(payloads.payloads[i].key)){
            payloads.payloads[i].field = i == 0?'empty owner':i == 1?'empty contact':i == 2?'empty location':
                i == 3?'empty name': i== 4?'empty model':i==5?'empty installmentpaid':
                i == 6?'empty installmentduration':i == 7?'empty delinquent':i == 8?'empty description':'pass'
            payloads.payloads[i].has_error = true // has_error is important
            error_found = payloads.payloads[i]
            break
        }
    }

    if(error_found)
        return res.json(error_found)
        
    payloads.payloads = payloads.payloads.filter(filter => filter.isChanged);
    userDB.updateProperty(req.body)
        .then(response => res.json(response))
        .catch(err => res.json(err))
}

const dropProperties = (req, res) => {
    const cookies = req.cookies

    if(!cookies)
        return res.sendStatus(401)
    
    const bearerToken = req.headers.authorization.split(' ')[1]
    
    const verify = jwt.verify(bearerToken, process.env.PUBLIC_TOKEN, (err, decoded) => {
        if(err)
            return res.sendStatus(401)
        return decoded
    })

    if(!verify)
        return res.sendStatus(401)

    userDB.dropProperty(req.params.propertyID)
        .then(response => {
            res.json(response)
        })
        .catch(err => res.json(err))
}

module.exports = { retrievePostedProperties, updateVehicleProperties, updateJewelryProperties, dropProperties }