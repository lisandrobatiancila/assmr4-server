const multer = require('multer')
const jwt = require('jsonwebtoken')
const path = require('path')
const logs = require('../../../../middleware/logs/logs')
const { Users } =  require('../../../../../model/DBModel')

const userDB = new Users()
var vehicleImages = []
const storageV = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'images/vehicles')
    },
    filename: (req, file, cb) => {
        const { fileCount } = req.body

        const { vehicleOwner, vehicleContactno, vehicleLocation, vehicleName, vehicleModel, vehicleInstallmentpaid, 
            vehicleInstallmentduration, vehicleDelinquent, vehicleDescription } = req.body

        const validationPass = {
            has_error: /[^\s]/.test(vehicleOwner)?/[^\s]/.test(vehicleContactno)?/[^\s]/.test(vehicleLocation)?/[^\s]/.test(vehicleName)?
                /[^\s]/.test(vehicleModel)?/[^\s]/.test(vehicleInstallmentpaid)?/[^\s]/.test(vehicleInstallmentduration)?
                /[^\s]/.test(vehicleDelinquent)?/[^\s]/.test(vehicleDescription)?fileCount == 6?false:true:true:true:true:true:true:
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

        if (validationPass.has_error)
            return cb(new Error(JSON.stringify(validationPass)))
        if(parseInt(fileCount) < 6 || parseInt(fileCount) > 6)
            return cb(new Error(JSON.stringify({message: 'kindly upload at least 6 images', fileCount_err: true})))

        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)+'.jpg'
        const fileName = file.fieldname+'-'+uniqueSuffix
        vehicleImages.push(`images/vehicles/${fileName}`)

        cb(null, fileName)
    }
})

var jewelryImages = []
const storageJ = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'images/jewelries')
    },
    filename: (req, file, cb) => {
        const { fileCount } = req.body

        const { jowner, jcontactno, jlocation, jjewelryName, jjewelryType, jinstallmentpaid, jinstallmentduration, 
            jdelinquent, jdescription } = req.body

        const validationPass = {
            has_error: /[^\s]/.test(jowner)?/[^\s]/.test(jcontactno)?/[^\s]/.test(jlocation)?/[^\s]/.test(jjewelryName)?
                /[^\s]/.test(jjewelryType)?/[^\s]/.test(jinstallmentpaid)?/[^\s]/.test(jinstallmentduration)?
                /[^\s]/.test(jdelinquent)?/[^\s]/.test(jdescription)?fileCount == 3?false:true:true:true:true:true:true:true:true:true:true,
            jowner_err: /[^\s]/.test(jowner)?false:true,
            jlocation_err: /[^\s]/.test(jlocation)?false:true,
            jjewelryName_err: /[^\s]/.test(jjewelryName)?false:true,
            jjewelryType_err: /[^\s]/.test(jjewelryType)?false:true,
            jinstallmentpaid_err: /[^\s]/.test(jinstallmentpaid)?false:true,
            jinstallmentduration_err: /[^\s]/.test(jinstallmentduration)?false:true,
            jdelinquent_err: /[^\s]/.test(jdelinquent)?false:true,
            jdescription_err: /[^\s]/.test(jdescription)?false:true,
            jdelinquent_err: /[^\s]/.test(jdelinquent)?false:true,
            fileCount_err: fileCount == 3?false:true
        }

        if(validationPass.has_error){
            logs.logActions(`postController.js - postJewelries ${JSON.stringify(validationPass)}`)
                return cb(new Error(JSON.stringify(validationPass)))
        }
        
        if(parseInt(fileCount) < 3 || parseInt(fileCount) > 3)
            return cb(new Error(JSON.stringify({message: 'kindly upload at least 3 images', fileCount_err: true})))
        
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)+'.jpg'
        const fileName = file.fieldname+'-'+uniqueSuffix
        jewelryImages.push(`images/jewelries/${fileName}`)
        cb(null, fileName)
    }
})

var realestateImages = []
const storageR = multer.diskStorage({
    destination: (req, file, cb) =>{
        const { realestateType } = req.body
        
        const SUBFOLDER = realestateType === 'house'?'houses'
            :realestateType === 'house and lot'?'hals':realestateType ==='lot'?'lots':''

        cb(null, `images/realestates/${SUBFOLDER}`)
    },
    filename: (req, file, cb) =>{
        const { realestateOwner, realestateContactno, realestateLocation, realestateDeveloper, realestateType, realestateInstallmentpaid, 
            realestateInstallmentduration, realestateDelinquent, realestateDescriptions, fileCount } = req.body

        const validationPass = {
            has_error: /[^\s]/.test(realestateOwner)?/[^\s]/.test(realestateContactno)?/[^\s]/.test(realestateLocation)?
                /[^\s]/.test(realestateType)?/[^\s]/.test(realestateDeveloper)?/[^\s]/.test(realestateInstallmentpaid)?
                /[^\s]/.test(realestateInstallmentduration)?/[^\s]/.test(realestateDelinquent)?
                /[^\s]/.test(realestateDescriptions)?false:true:true:true:true:true:true:true:true:true,
            realowner_err: /[^\s]/.test(realestateOwner)?false:true,
            realcontactno_err: /[^\s]/.test(realestateContactno)?false:true,
            reallocation_err: /[^\s]/.test(realestateLocation)?false:true,
            realdeveloper_err: /[^\s]/.test(realestateDeveloper)?false:true,
            realtype_err: /[^\s]/.test(realestateType)?false:true,
            realinstallmentpaid_err: /[^\s]/.test(realestateInstallmentpaid)?false:true,
            realinstallmentduration_err: /[^\s]/.test(realestateInstallmentduration)?false:true,
            realdelinquent_err: /[^\s]/.test(realestateDelinquent)?false:true,
            realdescription_err: /[^\s]/.test(realestateDescriptions)?false:true,
            fileCount_err: /house.?/.test(realestateType)?fileCount == 5?false:true:fileCount == 3?false:true
        }

        if(validationPass.has_error)
            return cb(new Error(JSON.stringify(validationPass)))
        if(/house.?/.test(realestateType)?fileCount == 5?false:true:fileCount == 3?false:true)
            return cb(new Error(JSON.stringify({message: /house.?/.test(realestateType)?"Kindly upload at least 5 images"
                :"Kindly upload at least 3 images", fileCount_err: true, has_error: true})))

        let uniqueSuffix = fileName = ''

        switch(realestateType){
            case 'house':
                uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)+'.jpg'
                fileName = file.fieldname+'-'+uniqueSuffix
                realestateImages.push(`images/realestates/houses/${fileName}`)
                
                cb(null, fileName)
            break;
            case 'house and lot':
                uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)+'.jpg'
                fileName = file.fieldname+'-'+uniqueSuffix
                realestateImages.push(`images/realestates/hals/${fileName}`)

                cb(null, fileName)
            break;
            case 'lot':
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

const uploadsV = multer({storage: storageV}).array('images', 6)
const uploadsR = multer({storage: storageR}).fields([
    {name: 'images', maxCount: 5},
    {name: 'images', maxCount: 2},
    {name: 'images', maxCount: 5},
])
const uploadsJ = multer({storage: storageJ}).array('files', 3)

const postVehicle = (req, res) => {
    
    uploadsV(req, res, function(err){
        if(err instanceof multer.MulterError){
            logs.logActions(`postController.js - postVehicle multer instance error`)
            return res.json({message: 'err images'})
        }
        else if(err){
            logs.logActions(`postController.js - postVehicle ${err}`)
            
            return res.json(JSON.parse(err.message))
        }
        
        const { vehicleOwner, vehicleContactno, vehicleLocation, vehicleName, vehicleModel, vehicleInstallmentpaid, 
            vehicleInstallmentduration, vehicleDelinquent, vehicleDescription, fileCount } = req.body

        const validationPass = {
            has_error: /[^\s]/.test(vehicleOwner)?/[^\s]/.test(vehicleContactno)?/[^\s]/.test(vehicleLocation)?/[^\s]/.test(vehicleName)?
                /[^\s]/.test(vehicleModel)?/[^\s]/.test(vehicleInstallmentpaid)?/[^\s]/.test(vehicleInstallmentduration)?
                /[^\s]/.test(vehicleDelinquent)?/[^\s]/.test(vehicleDescription)?fileCount == 6?false:true:true:true:true:true:true:
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

        userDB.postProperties('vehicle', refToken, req.body, vehicleImages)
            .then(response => res.json(response))
            .catch(err => res.json(err))
    })
}

const postRealestates = (req, res) => {
    uploadsR(req, res, function(err){
        if(err instanceof multer.MulterError){
            logs.logActions(`postController.js - postRealestate multer instance error`)
            return res.json({message: 'err images'})
        }
        else if(err){
            logs.logActions(`postController.js - postRealestates ${err}`)
            return res.json(JSON.parse(err.message))
        }
        const { realestateOwner, realestateContactno, realestateLocation, realestateDeveloper, realestateType, realestateInstallmentpaid, 
            realestateInstallmentduration, realestateDelinquent, realestateDescriptions, fileCount } = req.body

        const validationPass = {
            has_error: /[^\s]/.test(realestateOwner)?/[^\s]/.test(realestateContactno)?/[^\s]/.test(realestateLocation)?
                /[^\s]/.test(realestateType)?/[^\s]/.test(realestateDeveloper)?/[^\s]/.test(realestateInstallmentpaid)?
                /[^\s]/.test(realestateInstallmentduration)?/[^\s]/.test(realestateDelinquent)?
                /[^\s]/.test(realestateDescriptions)?/house.?/.test(realestateType)?fileCount == 5?false:true:fileCount == 3?false:true:true:true:true:true:true:true:true:true:true,
            realowner_err: /[^\s]/.test(realestateOwner)?false:true,
            realcontactno_err: /[^\s]/.test(realestateContactno)?false:true,
            reallocation_err: /[^\s]/.test(realestateLocation)?false:true,
            realdeveloper_err: /[^\s]/.test(realestateDeveloper)?false:true,
            realtype_err: /[^\s]/.test(realestateType)?false:true,
            realinstallmentpaid_err: /[^\s]/.test(realestateInstallmentpaid)?false:true,
            realinstallmentduration_err: /[^\s]/.test(realestateInstallmentduration)?false:true,
            realdelinquent_err: /[^\s]/.test(realestateDelinquent)?false:true,
            realdescription_err: /[^\s]/.test(realestateDescriptions)?false:true,
            fileCount_err: /house.?/.test(realestateType)?fileCount == 5?false:true:fileCount == 3?false:true
        }

        if(validationPass.has_error){
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

const postJewelries = async (req, res) => {
    const token = req.headers.authorization.split(' ')[1]
    const verify = await new Promise((resolve, reject) => {
        jwt.verify(token, process.env.PUBLIC_TOKEN, (err, decoded) => {
            if(err)
                reject(err)
            resolve(decoded)
        })
    })

    if(!verify)
        return res.sendStatus(401)
        
    uploadsJ(req, res, function(err){
        if(err instanceof multer.MulterError)
            return res.json({message: 'err images'})
        
        else if(err)
            return res.json(JSON.parse(err.message))

        const { jowner, jcontactno, jlocation, jjewelryName, jjewelryType, jinstallmentpaid, jinstallmentduration, 
            jdelinquent, jdescription , fileCount } = req.body

        const validationPass = {
            has_error: /[^\s]/.test(jowner)?/[^\s]/.test(jcontactno)?/[^\s]/.test(jlocation)?/[^\s]/.test(jjewelryName)?
                /[^\s]/.test(jjewelryType)?/[^\s]/.test(jinstallmentpaid)?/[^\s]/.test(jinstallmentduration)?
                /[^\s]/.test(jdelinquent)?/[^\s]/.test(jdescription)?fileCount == 3?false:true:true:true:true:true:true:true:true:true:true,
            jowner_err: /[^\s]/.test(jowner)?false:true,
            jjewelryContactno_err: /[^\s]/.test(jcontactno)?false:true,
            jlocation_err: /[^\s]/.test(jlocation)?false:true,
            jjewelryName_err: /[^\s]/.test(jjewelryName)?false:true,
            jjewelryType_err: /[^\s]/.test(jjewelryType)?false:true,
            jinstallmentpaid_err: /[^\s]/.test(jinstallmentpaid)?false:true,
            jinstallmentduration_err: /[^\s]/.test(jinstallmentduration)?false:true,
            jdelinquent_err: /[^\s]/.test(jdelinquent)?false:true,
            jdescription_err: /[^\s]/.test(jdescription)?false:true,
            jdelinquent_err: /[^\s]/.test(jdelinquent)?false:true,
            fileCount_err: fileCount == 3?false:true
        }

        if(validationPass.has_error){
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
                res.json(err)
            })  // mistake in implementation BY USING THE REFTOKEN, WE SHOULD AVOID THIS, PERO PASAGDI NALANG!!!
    })
}

const getNaCoLo = async (req, res) => {
    const token = req.headers.authorization.split(' ')[1]

    var verified = await new Promise((resolve, reject) => {
        jwt.verify(token, process.env.PUBLIC_TOKEN, (err, decoded) => {
            if(err)
                reject(err)
            resolve(decoded)
        })
    })

    if(!verified)
        return res.sendStatus(401)

    userDB.getNaCoLo(verified.email)
        .then(response => res.json(response))
        .catch(err => res.json(err))
}  // get the active user [name, contactno, location]

module.exports = { postVehicle, postRealestates, postJewelries, getNaCoLo }