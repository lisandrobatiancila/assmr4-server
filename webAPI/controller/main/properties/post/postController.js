const multer = require('multer')
const path = require('path')
const logs = require('../../../../middleware/logs/logs')
const { Users } =  require('../../../../../model/DBModel')

const userDB = new Users()
var vehicleImages = []
const storageV = multer.diskStorage({
    destination: (req, file, cb) => {
        // cb(null, 'images/vehicles')
    },
    filename: (req, file, cb) => {
        const { fileCount } = req.body
        if(parseInt(fileCount) < 6 || parseInt(fileCount) > 6)
            return cb(new Error('kindly upload at least 6 images'))

        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)+'.jpg'
        const fileName = file.fieldname+'-'+uniqueSuffix
        vehicleImages.push(`images/vehicles/${fileName}`)
        // cb(null, fileName)
    }
})

var jewelryImages = []
const storageJ = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'images/jewelries')
    },
    filename: (req, file, cb) => {
        const { fileCount } = req.body
        if(parseInt(fileCount) < 3 || parseInt(fileCount) > 3)
            return cb(new Error('kindly upload at least 3 images'))
        
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)+'.jpg'
        const fileName = file.fieldname+'-'+uniqueSuffix
        jewelryImages.push(`images/jewelries/${fileName}`)
        cb(null, fileName)
    }
})

var realestateImages = []
const storageR = multer.diskStorage({
    destination: (req, file, cb) =>{
        const { rrealestateType } = req.body

        const SUBFOLDER = rrealestateType === 'house'?'houses'
        :rrealestateType === 'house and lot'?'hals':rrealestateType ==='lot'?'lots':''

        cb(null, `images/realestates/${SUBFOLDER}`)
    },
    filename: (req, file, cb) =>{
        const { rowner, rlocation, rcontactno, rrealestateType, rdeveloper, rinstallmentpaid, rinstallmentduration, rdelinquent, 
            rdescription, fileCount } = req.body
        const validationPass = [
            {
                type: 'owner',
                isPassed: /[^\s]/.test(rowner),
                message: /[^\s]/.test(rowner)?'':'empty owner'
            },
            {
                type: 'location',
                isPassed: /[^\s]/.test(rlocation),
                message: /[^\s]/.test(rlocation)?'':'empty location'
            },
            {
                type: 'contactno',
                isPassed: /[^\s]/.test(rcontactno),
                message: /[^\s]/.test(rcontactno)?'':'empty contactno'
            },
            {
                type: 'realestateType',
                isPassed: /[^\s]/.test(rrealestateType),
                message: /[^\s]/.test(rrealestateType)?'':'no realestate type'
            },
            {
                type: 'developer',
                isPassed: /house.?/.test(rrealestateType)?
                    /[^\s]/.test(rdeveloper):true,
                message: /house.?/.test(rrealestateType)?
                /[^\s]/.test(rdeveloper)?'':'empty developer':''
            },
            {
                type: 'installmentpaid',
                isPassed: /[^\s]/.test(rinstallmentpaid),
                message: /[^\s]/.test(rinstallmentpaid)?'':'empty installmentpaid'
            },
            {
                type: 'installmentduration',
                isPassed: /[^\s]/.test(rinstallmentduration),
                message: /[^\s]/.test(rinstallmentduration)?'':'empty installmentduration'
            },
            {
                type: 'delinquent',
                isPassed: /[^\s]/.test(rdelinquent),
                message: /[^\s]/.test(rdelinquent)?'':'empty delinquent'
            },
            {
                type: 'description',
                isPassed: /[^\s]/.test(rdescription),
                message: /[^\s]/.test(rdescription)?'':'empty description'
            },{
                type: 'image',
                isPassed: /house.?/.test(rrealestateType)?parseInt(fileCount) == 5
                    :parseInt(fileCount) == 2,
                message: /house.?/.test(rrealestateType)?parseInt(fileCount) == 5?'':'kindly upload at least 5 images'
                :parseInt(fileCount) == 2?'': 'kind upload at least 2 images'
            }
        ]
        let uniqueSuffix = fileName = ''
        switch(rrealestateType){
            case 'house':
                if(parseInt(fileCount) < 5 || parseInt(fileCount) > 5)
                    return cb(new Error('kindly upload at least 5 images'))
                else if(!validationPass.every(realPass => realPass.isPassed)){
                    logs.logActions(`postController.js - postRealestates ${validationPass}`)
                    return cb(new Error(validationPass))
                }

                uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)+'.jpg'
                fileName = file.fieldname+'-'+uniqueSuffix
                realestateImages.push(`images/realestates/houses/${fileName}`)
                
                cb(null, fileName)
            break;
            case 'house and lot':
                if(parseInt(fileCount) < 5 || parseInt(fileCount) > 5){
                    return cb(new Error('kindly upload at least 5 images'))
                }
                else if(!validationPass.every(realPass => realPass.isPassed)){
                    logs.logActions(`postController.js - postRealestates ${validationPass}`)
                    return cb(new Error(validationPass))
                }

                uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)+'.jpg'
                fileName = file.fieldname+'-'+uniqueSuffix
                realestateImages.push(`images/realestates/hals/${fileName}`)

                cb(null, fileName)
            break;
            case 'lot':
                if(parseInt(fileCount) < 2 || parseInt(fileCount) > 2){
                    return cb(new Error('kindly upload at least 2 images'))
                }
                else if(!validationPass.every(realPass => realPass.isPassed)){
                    logs.logActions(`postController.js - postRealestates ${validationPass}`)
                    return cb(new Error(validationPass))
                }

                uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)+'.jpg'
                fileName = file.fieldname+'-'+uniqueSuffix
                realestateImages.push(`images/realestates/lots/${fileName}`)
                
                cb(null, fileName)
            break;
            default:
                console.log('no realestateType')
        }
    }
})

const uploadsV = multer({storage: storageV}).array('files', 6)
const uploadsR = multer({storage: storageR}).fields([
    {name: 'files', maxCount: 5},
    {name: 'files', maxCount: 2},
    {name: 'files', maxCount: 5},
])
const uploadsJ = multer({storage: storageJ}).array('files', 3)

const postVehicle = (req, res) => {
    
    uploadsV(req, res, function(err){
        if(err instanceof multer.MulterError){
            logs.logActions(`postController.js - postVehicle multer instance error`)
        }
        else if(err){
            logs.logActions(`postController.js - postVehicle ${err}`)
        }
        
        const { vehicleOwner, vehicleContactno, vehicleLocation, vehicleName, vehicleModel, vehicleInstallmentpaid, 
            vehicleInstallmentduration, vehicleDelinquent, vehicleDescription, fileCount } = req.body

        const validationPass = {
            has_error: /[^\s]/.test(vehicleOwner)?/[^\s]/.test(vehicleContactno)?/[^\s]/.test(vehicleLocation)?/[^\s]/.test(vehicleName)?
                /[^\s]/.test(vehicleModel)?/[^\s]/.test(vehicleInstallmentpaid)?/[^\s]/.test(vehicleInstallmentduration)?
                /[^\s]/.test(vehicleDelinquent)?/[^\s]/.test(vehicleDescription)?fileCount > 5 && fileCount < 7:true:true:true:true:true:
            true:true:true:true,
            vo: /[^\s]/.test(vehicleOwner)?false:true,
            vc: /[^\s]/.test(vehicleContactno)?false:true,
            vl: /[^\s]/.test(vehicleLocation)?false:true,
            vn: /[^\s]/.test(vehicleName)?false:true,
            vm: /[^\s]/.test(vehicleModel)?false:true,
            vip: /[^\s]/.test(vehicleInstallmentpaid)?false:true,
            vid: /[^\s]/.test(vehicleInstallmentduration)?false:true,
            vdel: /[^\s]/.test(vehicleDelinquent)?false:true,
            vdesc: /[^\s]/.test(vehicleDescription)?false:true,
            vimg: fileCount > 5 && fileCount < 7?false:true,
            vimg_mssg: fileCount < 6?"Kindly upload at least 6 images":
                fileCount > 6?"Kindly upload at least 6 images":""
        }

        if(validationPass.has_error){
            logs.logActions(`postController.js - postVehicle ${JSON.stringify(validationPass)}`)
                return res.json(
                    validationPass
                )
        }
        //uploading files here...
        if(!req.cookies){
            logs.logActions(`a 401 Unauthorized / cookies mistake / expire cookies`)
            return res.sendStatus(401)
        }
        const refToken = req.cookies.userRefToken

        // userDB.postProperties('vehicle', refToken, req.body, vehicleImages)
        //     .then(response => res.json(response))
        //     .catch(err => console.log(err))
    })
}

const postRealestates = (req, res) => {
    uploadsR(req, res, function(err){
        if(err instanceof multer.MulterError){
            console.log(err)
            console.log('instance')
        }
        else if(err){
            console.log(err)
            logs.logActions(`postController.js - postRealestates ${err}`)
            return res.json(
                {
                    isUnique: true,
                    message: 'make sure all fields are not empty!'
                }
            )
        }
        const { rowner, rlocation, rcontactno, rrealestateType, rdeveloper, rinstallmentpaid, rinstallmentduration, rdelinquent, 
            rdescription, fileCount } = req.body

        const validationPass = [
            {
                type: 'owner',
                isPassed: /[^\s]/.test(rowner),
                message: /[^\s]/.test(rowner)?'':'empty owner'
            },
            {
                type: 'location',
                isPassed: /[^\s]/.test(rlocation),
                message: /[^\s]/.test(rlocation)?'':'empty location'
            },
            {
                type: 'contactno',
                isPassed: /[^\s]/.test(rcontactno),
                message: /[^\s]/.test(rcontactno)?'':'empty contactno'
            },
            {
                type: 'realestateType',
                isPassed: /[^\s]/.test(rrealestateType),
                message: /[^\s]/.test(rrealestateType)?'':'no realestate type'
            },
            {
                type: 'developer',
                isPassed: /house.?/.test(rrealestateType)?
                    /[^\s]/.test(rdeveloper):true,
                message: /house.?/.test(rrealestateType)?
                /[^\s]/.test(rdeveloper)?'':'empty developer':''
            },
            {
                type: 'installmentpaid',
                isPassed: /[^\s]/.test(rinstallmentpaid),
                message: /[^\s]/.test(rinstallmentpaid)?'':'empty installmentpaid'
            },
            {
                type: 'installmentduration',
                isPassed: /[^\s]/.test(rinstallmentduration),
                message: /[^\s]/.test(rinstallmentduration)?'':'empty installmentduration'
            },
            {
                type: 'delinquent',
                isPassed: /[^\s]/.test(rdelinquent),
                message: /[^\s]/.test(rdelinquent)?'':'empty delinquent'
            },
            {
                type: 'description',
                isPassed: /[^\s]/.test(rdescription),
                message: /[^\s]/.test(rdescription)?'':'empty description'
            },{
                type: 'image',
                isPassed: /house.?/.test(rrealestateType)?parseInt(fileCount) == 5
                    :parseInt(fileCount) == 2,
                message: /house.?/.test(rrealestateType)?parseInt(fileCount) == 5?'':'kindly upload at least 5 images'
                :parseInt(fileCount) == 2?'': 'kind upload at least 2 images'
            }
        ]

        if(!validationPass.every(realPass => realPass.isPassed)){
            logs.logActions(`postController.js - postRealestates ${err}`)
            return res.json(
                validationPass
            )
        }

        if(!req.cookies){
            logs.logActions(`a 401 Unauthorized / cookies mistake / expire cookies`)
            return res.sendStatus(401)
        }

        const refToken = req.cookies.userRefToken

        userDB.postProperties('realestate', refToken, req.body, realestateImages)
            .then(response => {
                console.log(response)
                realestateImages = []
                res.json(response)
            })
            .catch(err => {
                console.log(err)
            })
    })
}

const postJewelries = (req, res) => {
    uploadsJ(req, res, function(err){
        if(err instanceof multer.MulterError)
            return res.json({message: 'err images'})
        else if(err)
            return res.json({message: 'others'})

        const { jowner, jlocation, jcontactno, jjewelryName, jjewelryType, jinstallmentpaid, jinstallmentduration, 
            jdelinquent, jdescription , fileCount } = req.body

        const validationPass = [
            {
                type: 'owner',
                isPassed: /[^\s]/.test(jowner),
                message: /[^\s]/.test(jowner)?'':'empty name'
            },
            {
                type: 'location',
                isPassed: /[^\s]/.test(jlocation),
                message: /[^\s]/.test(jlocation)?'':'empty location'
            },
            {
                type: 'contactno',
                isPassed: /[^\s]/.test(jcontactno),
                message: /[^\s]/.test(jcontactno)?/^\+?(\d.*){11}/.test(jcontactno)?'':'invalid contactno':'empty contactno'
            },
            {
                type: 'jewelryName',
                isPassed: /[^\s]/.test(jjewelryName),
                message: /[^\s]/.test(jjewelryName)?'':'empty jewelry name'
            },
            {
                type: 'jewelryType',
                isPassed: /[^\s]/.test(jjewelryType),
                message: /[^\s]/.test(jjewelryType)?'':'empty jewelry type'
            },
            {
                type: 'installmentpaid',
                isPassed: /[^\s]/.test(jinstallmentpaid),
                message: /[^\s]/.test(jinstallmentpaid)?'':'empty installmentpaid'
            },
            {
                type: 'installmentduration',
                isPassed: /[^\s]/.test(jinstallmentduration),
                message: /[^\s]/.test(jinstallmentduration)?'':'empty installmentduration'
            },
            {
                type: 'delinquent',
                isPassed: /[^\s]/.test(jdelinquent),
                message: /[^\s]/.test(jdelinquent)?'':'empty delinquent'
            },
            {
                type: 'description',
                isPassed: /[^\s]/.test(jdescription),
                message: /[^\s]/.test(jdescription)?'':'empty description'
            },
            {
                type: 'image',
                isPassed: parseInt(fileCount) == 3,
                message: parseInt(fileCount) == 3?'':'kindly upload at least 3 images'
            }
        ]
        if(!validationPass.every(jval => jval.isPassed)){
            logs.logActions(`postController.js - postJewelries ${JSON.stringify(validationPass)}`)
                return res.json(
                    validationPass
                )
        }
        //upload files here...
        if(!req.cookies){
            logs.logActions(`a 401 Unauthorized / cookies mistake / expire cookies`)
            return res.sendStatus(401)
        }
        const refToken = req.cookies.userRefToken

        userDB.postProperties('jewelry', refToken, req.body, jewelryImages)
            .then(response => {
                res.json(response)
            })
            .catch(err => {
                console.log(err)
            })
    })
}

module.exports = { postVehicle, postRealestates, postJewelries }