const { MobileUsers, MobileAssumrs } = require('../../../../model/DMMobileModel')
const jwt = require('jsonwebtoken')

const mobileUserDB = new MobileUsers()
const mobileAssmrDB = new MobileAssumrs()

const assumerInfo = (req, res) => {

    mobileUserDB.assumerInfo(req.body)
        .then(response => {
            res.json(response)
        })
        .catch(err => console.log(err))
}

const submitAssumptionForm = (req, res) => {
    try{
        const { company, job, salary } = req.body
        const token = req.headers.authorization

        jwt.verify(token, process.env.PUBLIC_TOKEN, (err, decoded) => {
            if(err)
                return res.sendStatus(500)

            const passFields = {
                fields: /[^\s]/.test(company)?/[^\s]/.test(job)?/[^\s]/.test(salary)?'':'salary':'job':'company',
                message: /[^\s]/.test(company)?/[^\s]/.test(job)?/[^\s]/.test(salary)?'all fields are passed':'empty salary':'empty job':'empty company',
                has_error: /[^\s]/.test(company)?/[^\s]/.test(job)?/[^\s]/.test(salary)?false:true:true:true
            }
        
            if (passFields.has_error)
                return res.json(passFields) //throw an error if fields are empty!
        
            mobileUserDB.submitAssumptionForm(req.body)
                .then(response => {
                    res.json(response)
                })
                .catch(err => {
                    // console.log(err)
                    res.json(err)
                })
        })//end of jwt verify
    }
    catch(err){
        console.log(err)
    }
}

const getPropertyOwnerInfo = (req, res) => {
    mobileAssmrDB.certainUserInfoUProp(req.params)
        .then(response => {
            res.json(response)
        })
        .catch(err => {
            res.json(err)
        })
}

module.exports = { assumerInfo, submitAssumptionForm, getPropertyOwnerInfo }