const jwt = require('jsonwebtoken')
const { Assumrs } = require('../../../../model/DBModel')
const logActions = require('../../../middleware/logs/logs')

const assumrDB = new Assumrs()

const verifyIfAssumerIsOwner = (req, res) => {
    const cookies = req.cookies

    if(!cookies.userRefToken)
        return res.sendStatus(401)
    
    const { propertyID } = req.params
    const token = req.headers.authorization.split(' ')[1]

    assumrDB.assumerIsOwner(token, propertyID)
        .then(response => {
            res.json(response)
        })
        .catch(err => {
            res.json(err)
        })
}

const getAssumerInfo = (req, res) => {
    assumrDB.getAssumerInfo(req.params)
        .then(response => {
            res.json(response)
        })
        .catch(err => {
            res.json(err)
        })
}

const userSubmitAssumptionForm = async (req, res) => {
    const token = req.headers.authorization.split(' ')[1]
    const verified = await new Promise((resolve, reject) => {
        jwt.verify(token, process.env.PUBLIC_TOKEN, (err, decoded) => {
            if(err)
                reject(err)
            resolve(decoded)
        })
    })
    if(!verified)
        return res.json({message: "expired token"})
    
    const { firstname, middlename, lastname, contactno, work, income, city, province, barangay, message } = req.body
    req.body = {...req.body, email: verified.email}

    const validationPassed = {
        has_error: /[^\s]/.test(firstname)?/[^\s]/.test(middlename)?/[^\s]/.test(lastname)?/[^\s]/.test(contactno)?
            /[^\s]/.test(work)?/[^\s]/.test(income)?/[^\s]/.test(city)?/[^\s]/.test(province)?/[^\s]/.test(barangay)?
            false:true:true:true:true:true:true:true:true:true,
        firstname_err: /[^\s]/.test(firstname)?false:true,
        middlename_err: /[^\s]/.test(middlename)?false:true,
        lastname_err: /[^\s]/.test(lastname)?false:true,
        contactno_err: /[^\s]/.test(contactno)?false:true,
        work_err: /[^\s]/.test(work)?false:true,
        income_err: /[^\s]/.test(income)?false:true,
        city_err: /[^\s]/.test(city)?false:true,
        province_err: /[^\s]/.test(province)?false:true,
        barangay_err: /[^\s]/.test(barangay)?false:true,
    }

    if(validationPassed.has_error)
        return res.json(validationPassed)  // throw an error

    assumrDB.userSubmitAssumption(req.body)
        .then(response => {
            res.json(response)
        })
        .catch(err => {
            logActions.logActions(`${err} at userSubmitAssumption line 42`)
            res.json(err)
        })
}

module.exports = { verifyIfAssumerIsOwner, getAssumerInfo, userSubmitAssumptionForm }