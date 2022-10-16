const jwt = require('jsonwebtoken')
const { Users }  = require('../../../../../model/DBModel')

const userDB = new Users()

const updateVehicleProperties = (req, res) => {
    const cookies = req.cookies

    if(!cookies)
        return res.sendStatus(401)
    
    const bearerToken = req.headers.authorization.split(' ')[1]
    // console.log(bearerToken)
    const verify = jwt.verify(bearerToken, process.env.PUBLIC_TOKEN, (err, decoded) => {
        if(err)
            return res.sendStatus(401)
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

const dropProperties = (req, res) => {
    
}

module.exports = { updateVehicleProperties, dropProperties }

// THIS IS UNUSED RIGHT NOW FOR ALL FILE