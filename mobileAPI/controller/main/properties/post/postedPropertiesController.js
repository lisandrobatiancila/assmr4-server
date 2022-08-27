const multer = require('multer')
var path = require('path')
var jwt = require('jsonwebtoken')

const { MobileUsers } = require('../../../../../model/DMMobileModel')

const mobileUserDB = new MobileUsers()
var EXEC_ONLY_ONCE = true
var vehicleImages = []
var jewelryImages = []
var realestateImages = []

let storageVehicle = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, '.')
    },
    filename: async (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)+'.jpg'

        const { vowner, vlocation, vcontactno, vtype, vmodel, vinstallmentpaid, vinstallmentduration, vdelinquent, vdescription } = req.body
        
        if(EXEC_ONLY_ONCE){
            EXEC_ONLY_ONCE = false
            const validationPass = [
                {'fields': 'vowner', message: /[^\s]/.test(vowner)?'':'empty owner', has_error: /[^\s]/.test(vowner)?true:false},//for vowner
                {'fields': 'vlocation', message: /[^\s]/.test(vlocation)?'':'empty location', has_error: /[^\s]/.test(vlocation)?true:false},
                {'fields': 'vcontactno', message: /[^\s]/.test(vcontactno)?'':'empty contactno', has_error: /[^\s]/.test(vcontactno)?true:false},
                {'fields': 'vtype', message: /[^\s]/.test(vtype)?'':'empty vehicle type', has_error: /[^\s]/.test(vtype)?true:false},
                {'fields': 'vmodel', message: /[^\s]/.test(vmodel)?'':'empty vehicle model', has_error: /[^\s]/.test(vmodel)?true:false},
                {'fields': 'vinstallmentpaid', message: /[^\s]/.test(vinstallmentpaid)?'':'empty installmentpaid', has_error: /[^\s]/.test(vinstallmentpaid)?true:false},
                {'fields': 'vinstallmentduration', message: /[^\s]/.test(vinstallmentduration)?'':'empty installmentduration', has_error: /[^\s]/.test(vinstallmentduration)?true:false},
                {'fields': 'vdelinquent', message: /[^\s]/.test(vdelinquent)?'':'empty delinquent', has_error: /[^\s]/.test(vdelinquent)?true:false},
                {'fields': 'vdescription', message: /[^\s]/.test(vdescription)?'':'empty description', has_error: /[^\s]/.test(vdescription)?true:false}
            ]
            const header = req.headers
            const token = header.authorization.split(' ')[1]
            const verify = await new Promise((resolve, reject) => {
                jwt.verify(token, process.env.PUBLIC_TOKEN, (err, decoded) => {
                    if(err){
                        return resolve({ message: 'Expired token', has_error: true})
                    }
                    resolve({message: '', has_error: false})
                })
            })
            if (verify.has_error)
                return cb([{message: verify.message, has_error: true}])
            if (!validationPass.every(valPass => valPass.has_error)){
                return cb(validationPass)
            }
        }

        const fileName = file.fieldname+'-'+uniqueSuffix
        vehicleImages.push(`images/vehicles/${fileName}`)
        cb(null, `./images/vehicles/${fileName}`)
    }
})

let storageJewelry = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, '.')
    },
    filename: async (req, file, cb) => {

        const { jowner, jlocation, jcontactno, jname, jtype, jinstallmentpaid, jinstallmentduration, jdelinquent, jdescription } = req.body
        if(EXEC_ONLY_ONCE){
            EXEC_ONLY_ONCE = false
            const validationPass = [
                {'fields': 'jowner', message: /[^\s]/.test(jowner)?'':'empty owner', has_error: /[^\s]/.test(jowner)?true:false},//for jowner
                {'fields': 'jlocation', message: /[^\s]/.test(jlocation)?'':'empty location', has_error: /[^\s]/.test(jlocation)?true:false},
                {'fields': 'jcontactno', message: /[^\s]/.test(jcontactno)?'':'empty contactno', has_error: /[^\s]/.test(jcontactno)?true:false},
                {'fields': 'jname', message: /[^\s]/.test(jname)?'':'empty jewelry type', has_error: /[^\s]/.test(jname)?true:false},
                {'fields': 'jtype', message: /[^\s]/.test(jtype)?'':'empty jewelry model', has_error: /[^\s]/.test(jtype)?true:false},
                {'fields': 'jinstallmentpaid', message: /[^\s]/.test(jinstallmentpaid)?'':'empty installmentpaid', has_error: /[^\s]/.test(jinstallmentpaid)?true:false},
                {'fields': 'jinstallmentduration', message: /[^\s]/.test(jinstallmentduration)?'':'empty installmentduration', has_error: /[^\s]/.test(jinstallmentduration)?true:false},
                {'fields': 'jdelinquent', message: /[^\s]/.test(jdelinquent)?'':'empty delinquent', has_error: /[^\s]/.test(jdelinquent)?true:false},
                {'fields': 'jdescription', message: /[^\s]/.test(jdescription)?'':'empty description', has_error: /[^\s]/.test(jdescription)?true:false}
            ]

            const header = req.headers
            const token = header.authorization.split(' ')[1]
            const verify = await new Promise((resolve, reject) => {
                jwt.verify(token, process.env.PUBLIC_TOKEN, (err, decoded) => {
                    if(err)
                        return resolve({message: 'Expired token', has_error: true})
                    resolve({message: '', has_error: false})
                })
            })
            if (verify.has_error)
                return cb([{message: verify.message, has_error: true}])
            if(!validationPass.every(valPass => valPass.has_error))
                return cb(validationPass)
        }

        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)+'.jpg'
        const fileName = file.fieldname+'-'+uniqueSuffix
        jewelryImages.push(`images/jewelries/${fileName}`)
        cb(null, `./images/jewelries/${fileName}`)
    }
})

let storageRealestate = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, '.')
    },
    filename: async (req, file, cb) => {
        let uniqueSuffix = fileName = ""
        const { realType } = req.body

        if(EXEC_ONLY_ONCE){
            const { rowner, rlocation, rcontactno, rdeveloper, rinstallmentpaid, rinstallmentduration, 
                rdelinquent, rdescription } = req.body

                EXEC_ONLY_ONCE = false
            const validationPass = [
                {'fields': 'rowner', message: /[^\s]/.test(rowner)?'':'empty owner', has_error: /[^\s]/.test(rowner)?true:false},//for jowner
                {'fields': 'rlocation', message: /[^\s]/.test(rlocation)?'':'empty location', has_error: /[^\s]/.test(rlocation)?true:false},
                {'fields': 'rcontactno', message: /[^\s]/.test(rcontactno)?'':'empty contactno', has_error: /[^\s]/.test(rcontactno)?true:false},
                {'fields': 'rdeveloper', message: ['house', 'house and lot'].includes(realType)?/[^\s]/.test(rdeveloper)?'':'empty jewelry type':'', 
                    has_error: ['house', 'house and lot'].includes(realType)?/[^\s]/.test(rdeveloper)?true:false:true},
                {'fields': 'rinstallmentpaid', message: /[^\s]/.test(rinstallmentpaid)?'':'empty installmentpaid', has_error: /[^\s]/.test(rinstallmentpaid)?true:false},
                {'fields': 'rinstallmentduration', message: /[^\s]/.test(rinstallmentduration)?'':'empty installmentduration', has_error: /[^\s]/.test(rinstallmentduration)?true:false},
                {'fields': 'rdelinquent', message: /[^\s]/.test(rdelinquent)?'':'empty delinquent', has_error: /[^\s]/.test(rdelinquent)?true:false},
                {'fields': 'rdescription', message: /[^\s]/.test(rdescription)?'':'empty description', has_error: /[^\s]/.test(rdescription)?true:false}
            ]
            const header = req.headers
            const token = header.authorization.split(' ')[1]
            const verify = await new Promise((resolve, reject) => {
                jwt.verify(token, process.env.PUBLIC_TOKEN, (err, decoded) => {
                    if(err)
                        return resolve({message: 'Expired token', has_error: true})
                    resolve({message: '', has_error: false})
                })
            })
            
            if (verify.has_error)
                return cb([{message: verify.message, has_error: true}])
            if(!validationPass.every(valPass => valPass.has_error))
                return cb(validationPass)
        }
        switch(realType) {
            case 'house and lot':
                uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)+'.jpg'
                fileName = file.fieldname+'-'+uniqueSuffix
                realestateImages.push(`images/realestates/hals/${fileName}`)
                cb(null, `./images/realestates/hals/${fileName}`)
            break;
            case 'house':
                uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)+'.jpg'
                fileName = file.fieldname+'-'+uniqueSuffix
                realestateImages.push(`images/realestates/houses/${fileName}`)
                cb(null, `./images/realestates/houses/${fileName}`)
            break;
            case 'lot':
                uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)+'.jpg'
                fileName = file.fieldname+'-'+uniqueSuffix
                realestateImages.push(`images/realestates/lots/${fileName}`)
                cb(null, `./images/realestates/lots/${fileName}`)
            break;
            default:
                console.log('no propertyType')
                return cb(new Error('No propertyType'))
        }
    }
})

let vehicleFields = multer({ storage: storageVehicle }).fields(
    [
        {'name': 'images0', maxCount: 1}, {'name': 'images1', maxCount: 1},
        {'name': 'images2', maxCount: 1}, {'name': 'images3', maxCount: 1},
        {'name': 'images4', maxCount: 1}, {'name': 'images5', maxCount: 1}
    ]
)

let jewelryFields = multer({ storage: storageJewelry }).fields(
    [
        {'name': 'image0', maxCount: 1}, {'name': 'image1', maxCount: 1}, {'name': 'image2', maxCount: 1}
    ]
)

let realestatesFields = multer({ storage: storageRealestate }).fields([
    {'name': 'images0', maxCount: 1}, {'name': 'images1', maxCount: 1}, {'name': 'images2', maxCount: 1}, 
    {'name': 'images3', maxCount: 1}, {'name': 'images4', maxCount: 1}
])

const userUploadVehicleProperties = (req, res) => {
    vehicleFields(req, res, function(err) {
        //console.log(err) //err is an array of objects on here!
        if (err){
            EXEC_ONLY_ONCE = true
            res.json({ response: err, has_error: true})
            return
        }

        mobileUserDB.userUploadProperties(req.body, vehicleImages)
            .then(response => {
                EXEC_ONLY_ONCE = true //reset to default values
                vehicleImages = [] //reset to default values

                res.json(response)
            })
            .catch(err => {
                console.log(err)
                res.json(err)
            })
    })
}

const userUploadJewelryProperties = (req, res) => {
    jewelryFields(req, res, function(err) {
        if(err){
            EXEC_ONLY_ONCE = true
            return res.json({response: err, has_error: true})
        }
        
        mobileUserDB.userUploadProperties(req.body, jewelryImages)
            .then(response => {
                EXEC_ONLY_ONCE = true
                jewelryImages = []

                res.json(response)
            })
            .catch(err => {
                console.log(err)
                res.json(err)
            })
    })
}

const userUploadRealestateProperties = (req, res) => {
    realestatesFields(req, res, function(err) {
        if(err){
            EXEC_ONLY_ONCE = true
            return res.json({response: err, has_error: true})
        }
        
        mobileUserDB.userUploadProperties(req.body, realestateImages)
            .then(response => {
                EXEC_ONLY_ONCE = true
                realestateImages = []

                res.json(response)
            })
            .catch(err => {
                res.json(err)
            })
    })
}

const userTotalPosted_AssumedProperties = (req, res) => {
    mobileUserDB.myTolalPosted_AssumedProperties(req.params)
        .then(response => {
            res.json(response)
        })
        .catch(err => {
            console.log(err)
            res.json({message: err, has_error: true})
        })
}

const retrievePostedProperties = (req, res) => {
    mobileUserDB.myPostedProperties(req.params)
        .then(response => {
            res.json(response)
        })
        .catch(err => {
            console.log(err)
        })
}

const retrieveCertainRealestateType = (req, res) => {
    mobileUserDB.myCertainRealestateType(req.params)
        .then(response => {
            res.json(response)
        })
        .catch(err => {
            console.log(err)
            res.json(err)
        })
}

const certainPostedProperties = (req, res) => {
    mobileUserDB.myCertainPostedProperties(req.params)
        .then(response => {
            res.json(response)
        })
        .catch(err => {
            res.json(err)
        })
}

const toUpdateCertainPostedProperties = (req, res) => {
    mobileUserDB.toUpdateMyPostedProperties(req.params)
    .then(response => {
        res.json(response)
    })
    .catch(err => {
        console.log(err)
    })
}
const updateCertainPostedProperties = (req, res) => {
    mobileUserDB.updateMyPostedProperties(req.body)
        .then(response => {
            res.json(response)
        })
        .catch(err => {
            res.json(err)
        })
}

const dropCertainPostedProperties = (req, res) => {
    mobileUserDB.dropMyPostedProperties(req.body)
        .then(response => {
            res.json(response)
        })
        .catch(err => {
            console.log(err)
        })
}

module.exports = { userUploadVehicleProperties, userUploadJewelryProperties, userUploadRealestateProperties, userTotalPosted_AssumedProperties, 
    retrievePostedProperties, retrieveCertainRealestateType , certainPostedProperties, toUpdateCertainPostedProperties, 
    updateCertainPostedProperties, dropCertainPostedProperties }