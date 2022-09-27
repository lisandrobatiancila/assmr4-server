const DataStore = require('nedb')
const bcrpyt = require('bcrypt')
const jwt = require('jsonwebtoken')
const bridge = require('../webAPI/middleware/bridge/bridge')
const { of, from, reduce, map, concatAll, switchMap, merge, tap, concat, forkJoin, async, groupBy, mergeMap } = require('rxjs')

class Users{
    constructor(){
        this.usersDS = new DataStore({filename: './database/users.db'})
        this.accountDS = new DataStore({filename: './database/accounts.db'})
        this.propertiesDS = new DataStore({filename: './database/properties.db'})
        this.vehicleDS = new DataStore({filename: './database/vehicles.db'})
        this.vehicleImagesDS = new DataStore({filename: './database/vehicle_images.db'})
        this.jewelriesDS = new DataStore({filename: './database/jewelries.db'})
        this.realestatesDS = new DataStore({filename: './database/realestates.db'})
        this.housesDS = new DataStore({filename: './database/rhouses.db'})
        this.halsDS = new DataStore({filename: './database/rhals.db'})
        this.lotsDS = new DataStore({filename: './database/rlots.db'})
    }
    signupUser(params){
        return new Promise(async (resolve, reject) => {
            const { email, password } = params
            const {firstname, middlename, lastname, gender, contactno} = params
            const { province, municipality, barangay} = params.address

            const pwdDecrypt = bcrpyt.hashSync(password, 10)

            try{
                if(await bridge.isUserExists(email))
                    return resolve({
                        message: 'user already exists!'
                    })
                let userID = await new Promise((resolve, reject) => {
                    this.usersDS.loadDatabase()
                    this.usersDS.insert({firstname, middlename, lastname, gender, contactno, province, municipality, barangay},
                        function(err, user){
                            if(err)
                                reject(err)
                            resolve(user)
                        })
                })

                this.accountDS.loadDatabase()
                this.accountDS.insert({user_id: userID._id, email, password: pwdDecrypt})
    
                resolve({
                    message: 'signup was successfull!'
                })
            }
            catch(err){
                reject(err)
            }
        })
    }
    userIsAlreadyExist(email) {
        const found = new Promise((resolve, reject) => {

            this.accountDS.loadDatabase()
            this.accountDS.findOne({email}, { email: 1 }, function(err, accRec) {
                if(err)
                    reject(err)
                if (accRec)
                    resolve(true)
                resolve(false)
            })
        })

        return found
    }
    signinUser(params){
        return new Promise(async(resolve, reject) => {
            try{
                const { email, password } = params
                
                let userFound = await new Promise((resolve, reject) => {
                    this.accountDS.loadDatabase()
                    this.accountDS.findOne({email: email}, {password: 1, user_id: 1}, function(err, records){
                        if(err)
                            return reject(err)

                        else if(records)
                            resolve({
                                message: 'credentials accepted',
                                isPassed: true,
                                password: records.password,
                                user_id: records.user_id
                            })
                        else
                            resolve({
                                message: 'invalid credentials',
                                isPassed: false,
                            })
                    })
                })
                
                const userFirstName = await new Promise((resolve, reject) => {
                    this.usersDS.loadDatabase()
                    this.usersDS.findOne({_id: userFound.user_id}, {firstname: 1}, function(err, records) {
                        if(err)
                            reject(err)
                        resolve(records)
                    })
                })

                if(userFound.isPassed){
                    const isSamePass = bcrpyt.compareSync(password, userFound.password)

                    if(isSamePass){
                        const refreshToken = jwt.sign(
                            {email},
                            process.env.REFRESH_TOKEN,
                            {expiresIn: 24*60*60*1000}
                        )
                        this.accountDS.loadDatabase()
                        this.accountDS.update({email}, {$set: {"cred.refreshToken": refreshToken}})
                        this.accountDS.loadDatabase()
                        // userFound = {...userFound, refreshToken} changed to
                        userFound = {
                            message: 'credentials accepted',
                            isPassed: true,
                            user: userFirstName.firstname,
                            refreshToken
                        }
                        
                        resolve(userFound)
                    }
                    else
                        reject({
                            message: 'invalid credentials',
                            isPassed: false,
                        })
                }
                else
                    reject(userFound) //invalid credentials
            }
            catch(err){
                reject(err)
            }
        })
    }
    verifyUser(refreshToken){
        return new Promise((resolve, reject) => {
            try{
                this.accountDS.loadDatabase()
                this.accountDS.findOne({"cred.refreshToken": refreshToken}, {email: 1}, function(err, record){
                    if(err)
                        reject(err)
                    resolve(record)
                })
            }
            catch(err){
                reject(err)
            }
        })
    }
    getNaCoLo(email) {
        return new Promise(async (resolve, reject) => {
            try{
                const userID = await new Promise((resolve, reject) => {
                    this.accountDS.loadDatabase()
                    this.accountDS.findOne({email}, {user_id: 1}, function(err, accRec) {
                        if(err)
                            reject(err)
                        resolve(accRec)
                    })
                })
                const user = await new Promise((resolve, reject) => {
                    this.usersDS.loadDatabase()
                    this.usersDS.findOne({_id: userID.user_id}, {firstname: 1, middlename: 1, lastname: 1, contactno: 1, 
                        province: 1, municipality: 1, barangay: 1}, function(err, userRec) {
                            if(err)
                                reject(err)
                            resolve(userRec)
                        })
                })

                resolve(user)
            }
            catch(err) {
                reject(err)
            }
        })
    }  // get active user [name, contactno, location = NaCoLo]
    postProperties(propType, refToken, params, propertyImages){
        return new Promise(async (resolve, reject) => {
            try{
                switch(propType){
                    case "vehicle":
                        let { vehicleOwner, vehicleContactno, vehicleLocation, vehicleName, vehicleModel, vehicleInstallmentpaid, 
                            vehicleInstallmentduration, vehicleDelinquent, vehicleDescription } = params
                        console.log(params)
                        let vproperty = await new Promise(async(resolve, reject) => {
                            this.propertiesDS.loadDatabase()
                            const userID = await bridge.userID(refToken)
                            
                            this.propertiesDS.insert({property_type: 'vehicle', user_id: userID.user_id, active: 1, assumption: 0},
                                function(err, record){
                                    if(err)
                                        reject(err)
                                    resolve(record)
                            })
                        })
                        
                        let vehicle = await new Promise((resolve, reject) => {
                            this.vehicleDS.loadDatabase()
                            this.vehicleDS.insert({vehicle_owner: vehicleOwner, vehicle_name: vehicleName, contactno: vehicleContactno, vehicle_location: vehicleLocation, 
                                vehicle_model: vehicleModel, vehicle_installmentpaid: vehicleInstallmentpaid, 
                                vehicle_installmentduration: vehicleInstallmentduration, delinquent: vehicleDelinquent, 
                                description: vehicleDescription, property_id: vproperty._id}, function(err, record){
                                    if(err)
                                        reject(err)
                                    resolve(record)
                                })
                        })

                        this.vehicleImagesDS.loadDatabase()
                        this.vehicleImagesDS.insert({vehicle_id: vehicle._id, images: propertyImages})
                        resolve({message: 'uploading properties was successfull', has_error: false})
                    break;
                    case "realestate":
                        const { realestateOwner, realestateContactno, realestateLocation, realestateDeveloper, realestateType, realestateInstallmentpaid, 
                            realestateInstallmentduration, realestateDelinquent, realestateDescriptions } = params
                        
                        let userID = await bridge.userID(refToken)

                        let property = await new Promise((resolve, reject) => {
                            this.propertiesDS.loadDatabase()
                            this.propertiesDS.insert({property_type: propType, user_id: userID.user_id, active: 1, assumption: 0}, function(err, record){
                                if(err)
                                    reject(err)
                                resolve(record)
                            })
                        })
                        
                        let realestate = await new Promise((resolve, reject) => {
                            this.realestatesDS.loadDatabase()
                            this.realestatesDS.insert({realestate_owner: realestateOwner, realestate_contactno: realestateContactno, realestate_type: realestateType, realestate_location: realestateLocation,
                                realestate_installmentpaid: realestateInstallmentpaid, realestate_installmentduration: realestateInstallmentduration,
                                realestate_delinquent: realestateDelinquent, realestate_description: realestateDescriptions, property_id: property._id}, function(err, record){
                                    if(err)
                                        reject(err)
                                    resolve(record)
                                })
                        })
                        
                        switch(realestateType){
                            case 'house':
                                this.housesDS.loadDatabase()
                                this.housesDS.insert({house_developer: realestateDeveloper, images: propertyImages, realestate_id: realestate._id})
                            break;
                            case 'house and lot':
                                this.halsDS.loadDatabase()
                                this.halsDS.insert({hal_developer: realestateDeveloper, images: propertyImages, realestate_id: realestate._id})
                            break;
                            case 'lot':
                                this.lotsDS.loadDatabase()
                                this.lotsDS.insert({images: propertyImages, realestate_id: realestate._id})
                            break;
                            default:
                                console.log('no realestateType')
                                reject({message: "no realestate type"})
                        }
                        resolve({message: 'uploading properties was successfull', has_error: false})
                    break;
                    case "jewelry":
                        const { jowner, jlocation, jcontactno, jjewelryName, jjewelryType, jinstallmentpaid, 
                            jinstallmentduration, jdelinquent, jdescription } = params
                        
                        let jproperty = await new Promise(async (resolve, reject) => {
                            const userID = await bridge.userID(refToken)

                            this.propertiesDS.loadDatabase()
                            this.propertiesDS.insert({property_type: 'jewelry', user_id: userID.user_id, active: 1, 
                                assumption: 0}, function(err, record){
                                if(err)
                                    reject(err)
                                resolve(record)
                            })
                        })
                        this.jewelriesDS.loadDatabase()
                        this.jewelriesDS.insert({jewelry_owner: jowner, jewelry_contactno: jcontactno, jewelry_location: jlocation,
                            jewelry_name: jjewelryName, jewelry_type: jjewelryType, jewelry_installmentpaid: jinstallmentpaid,
                            jewelry_installmentduration: jinstallmentduration, jewelry_delinquent: jdelinquent, jewelry_description: jdescription,
                            images: propertyImages, property_id: jproperty._id})
                        
                        resolve({message: 'uploading properties was successfull', has_error: false})
                    break;
                    default:
                        reject({
                            message: 'no property type'
                        })
                }
            }
            catch(err){
                reject(err)
            }
        })
    }
    logOutUser(userRefToken){
        return new Promise((resolve, reject) => {
            try{
                
            }
            catch(err){
                reject(err)
            }
        })
    }
    retreievePostedProperties(email, propertyType, otherType) {
        return new Promise(async (resolve, reject) => {
            try{
                var user = null
                switch(propertyType) {
                    case "vehicles":
                        user = await new Promise((resolve, reject) => {
                            this.accountDS.loadDatabase()
                            this.accountDS.findOne({email}, {user_id: 1}, function(err, accRec) {
                                if(err)
                                    reject(err)
                                resolve(accRec)
                            })
                        })

                        const properties = new Promise((resolve, reject) => {
                            this.propertiesDS.loadDatabase()
                            this.propertiesDS.find({user_id: user.user_id, property_type: propertyType.replace('s', '')}, function(err, propRec) {
                                if(err)
                                    reject(err)
                                resolve(propRec)
                            })
                        })

                        properties.then(properties => {
                            properties.map(async property => await new Promise(async (resolve, reject) => {
                                const vehicles = await new Promise((resolve, reject) => {
                                    this.vehicleDS.loadDatabase()
                                    this.vehicleDS.findOne({property_id: property._id}, function(err, vehRec) {
                                        if(err)
                                            reject(err)
                                        resolve(vehRec)
                                    })
                                })

                                vehicles?vehicles.vimg = await new Promise((resolve, reject) => {
                                    this.vehicleImagesDS.loadDatabase()
                                    this.vehicleImagesDS.findOne({vehicle_id: vehicles._id}, function(err, vimg) {
                                        if(err)
                                            reject(err)
                                        resolve(vimg)
                                    })
                                }): []

                                property.vehicle = vehicles
                            }))
                            setTimeout(()=> {
                                resolve(properties)
                            }, 1500)
                        }).catch(err => reject(err))
                    break;
                    case "jewelries":
                         resolve({mess: 'jewel'})
                    break;
                    case "realestates":
                         resolve({mess: 'real'})
                    break;
                    default:
                        reject({message: "no propertyType"})
                }
            }
            catch(err) {
                reject(err)
            }
        })
    }  // all active user posted properties by type ['realestate', 'vehicle', 'jewelry'] by default it's "vehicle"
}

class Assumrs{
    constructor(){
        this.usersDS = new DataStore({filename: './database/users.db'})
        this.accountDS = new DataStore({filename: './database/accounts.db'})
        this.propertiesDS = new DataStore({filename: './database/properties.db'})
        this.vehicleDS = new DataStore({filename: './database/vehicles.db'})
        this.vehicleImagesDS = new DataStore({filename: './database/vehicle_images.db'})
        this.realestatesDS = new DataStore({filename: './database/realestates.db'})
        this.halsDS = new DataStore({filename: './database/rhals.db'})
        this.housesDS = new DataStore({filename: './database/rhouses.db'})
        this.lotsDS = new DataStore({filename: './database/rlots.db'})
        this.jewelriesDS = new DataStore({filename: './database/jewelries.db'})
        this.messagesDS = new DataStore({filename: './database/messages.db'})
        this.assumersDS = new DataStore({filename: './database/assumers.db'})
        this.assumptionsDS = new DataStore({filename: './database/assumptions.db'})
        this.historyDS = new DataStore({filename: './database/histories.db'})
        this.notificationDS = new DataStore({filename: './database/notifications.db'})
    }
    retrieveVehiclesForAssumption(){
        return new Promise(async (resolve, reject) => {
            try{
                let vehicles = new Promise((resolve, reject) => {
                    this.vehicleDS.loadDatabase()
                    this.vehicleDS.find({}, function(err, vrecords){
                        if(err)
                            reject(err)
                        resolve({propertyType: 'vehicle', vrecords})
                    })
                })
                const vehicleImages = await new Promise((resolve, reject) => {
                    this.vehicleImagesDS.loadDatabase()
                    this.vehicleImagesDS.find({}, function(err, vimgRec) {
                        if(err)
                            reject(err)
                        resolve(vimgRec)
                    })
                })

                from(vehicles)
                    .pipe(
                        switchMap((vehicles) => 
                            from(vehicleImages)
                                .pipe(
                                    map(vimg => {
                                        let vehicle = vehicles.vrecords.filter(vehicle => {
                                            if(vehicle._id == vimg.vehicle_id)
                                                return vehicle.vimg = vimg
                                        })
                                        return [{propertyType: vehicles.propertyType, vehicle}]
                                    }),
                                    concatAll(),
                                    reduce((acc, base) => [...acc, base], [])
                                )
                        )
                    )
                    .subscribe(response => {
                        resolve(response)
                    })
            }
            catch(err){
                reject(err)
            }
        })
    }
    retrieveRealestatesForAssumption(realestateType) {
        //THE realestateType can be ['all', 'house', 'house and lot', 'lot']
        return new Promise(async (resolve, reject) => {
            this.realestatesDS.loadDatabase()

            const realestates = new Promise((resolve, reject) => {
                this.realestatesDS.find(realestateType === 'all'?{}:{realestate_type: realestateType}, function(err, records) {
                    if(err)
                        reject(err)
                    resolve({propertyType: 'realestate', records})
                })
            })

            const realestateProperties = realestateType === 'house'? new Promise((resolve, reject) => {
                this.housesDS.loadDatabase()
                this.housesDS.find({}, function(err, records) {
                    if(err)
                        reject(err)
                    resolve(records)
                })
            })
                : realestateType === 'house and lot'? new Promise((resolve, reject) => {
                    this.halsDS.loadDatabase()
                    this.halsDS.find({}, function(err, records) {
                        if(err)
                            reject(err)
                        resolve(records)
                    })
                })
                : realestateType === 'lot'? new Promise((resolve, reject) => {
                    this.lotsDS.loadDatabase()
                    this.lotsDS.find({}, function(err, records) {
                        if(err)
                            reject(err)
                        resolve(records)
                    })
                })
                : new Promise(async (resolve, reject) => {  // the all inquiries, [BY DEFAULT IT IS ALL]
                    var REAL_ESTATE = []

                    const lots = await new Promise((resolve, reject) => {
                        this.lotsDS.loadDatabase()
                        this.lotsDS.find({}).limit(3).exec(function(err, lotRec) {
                            if(err)
                                reject(err)
                            resolve(lotRec)
                        })
                    })

                    const houses = await new Promise((resolve, reject) => {
                        this.housesDS.loadDatabase()
                        this.housesDS.find({}).limit(3).exec(function(err, houseRec) {
                            if(err)
                                reject(err)
                            resolve(houseRec)
                        })
                    })

                    const hals = await new Promise((resolve, reject) => {
                        this.halsDS.loadDatabase()
                        this.halsDS.find({}).limit(3).exec(function(err, halRec) {
                            if(err)
                                reject(err)
                            resolve(halRec)
                        })
                    })

                    REAL_ESTATE = [...lots, ...houses, ...hals]

                    resolve(REAL_ESTATE)
                })
                
            from(realestates)
                .pipe(
                    map(realestates => realestates),
                    switchMap(realestates => 
                        from(realestateProperties)
                            .pipe(
                                concatAll(),
                                map(realestateProp => {
                                    const realestated = realestates.records.filter(realestate => {
                                        if(realestate._id === realestateProp.realestate_id)
                                            return realestate.properties = realestateProp                                        
                                    })
                                    return {propertyType: 'realestate', realestates: realestated}
                                }),
                                reduce((acc, base) => [...acc, base], [])
                            )
                    )
                )
                .subscribe(realestate => {
                    resolve(realestate)
                })
        })
    }
    retrieveJewelriesForAssumption(){
        return new Promise((resolve, reject) => {
            this.jewelriesDS.loadDatabase()
            this.jewelriesDS.find({}, function(err, jrecords) {
                if(err)
                    reject(err)
                resolve([{propertyType: 'jewelry', jrecords}])
            })
        })
    }
    getCertainProperty(propertyType, propertyID){
        return new Promise(async (resolve, reject) => {
            try{
                switch(propertyType){
                    case 'vehicle':
                        let vehicles = await new Promise((resolve, reject) => {
                            this.vehicleDS.loadDatabase()
                            this.vehicleDS.findOne({_id: propertyID}, function(err, vrecords) {
                                if(err)
                                    reject(err)
                                resolve({propertyType: 'vehicle', ...vrecords})
                            })
                        })

                        of(vehicles)
                            .pipe(
                                map(async vehicle => {
                                    this.vehicleImagesDS.loadDatabase()
                                    let vimg = await new Promise((resolve, reject) => {
                                        this.vehicleImagesDS.findOne({vehicle_id: vehicle._id}, function(err, vimg) {
                                            if(err)
                                                reject(err)
                                            return resolve(vimg)
                                        })
                                    })
                                    vehicle.vimg = vimg

                                    return vehicle
                                })
                            )
                            .subscribe(v => resolve(v))
                    break;
                    case 'realestate':
                        const realestate = await new Promise((resolve, reject) => {
                            this.realestatesDS.loadDatabase()
                            this.realestatesDS.findOne({_id: propertyID}, function(err, jrecord) {
                                if(err)
                                    reject(err)
                                resolve(jrecord)
                            })
                        })
                        const {realestate_type} = realestate

                        switch(realestate_type){
                            case 'lot':
                                const lot = await new Promise((resolve, reject) => {
                                    this.lotsDS.loadDatabase()
                                    this.lotsDS.findOne({realestate_id: realestate._id}, function(err, lrecord) {
                                        if(err)
                                            reject(err)
                                        resolve(lrecord)
                                    })
                                })
                                realestate.images = lot

                                resolve(realestate)
                            break;
                            case 'house and lot':
                                const hal = await new Promise((resolve, reject) => {
                                    this.halsDS.loadDatabase()
                                    this.halsDS.findOne({realestate_id: realestate._id}, function(err, halRec) {
                                        if(err)
                                            reject(err)
                                        resolve(halRec)
                                    })
                                })
                                realestate.images = hal

                                resolve(realestate)
                            break;
                            case 'house':
                            break;
                            default:
                                console.log('no realestate_type')
                        }
                    break;
                    case 'jewelry':
                        let jewelries = new Promise((resolve, reject) => {
                            this.jewelriesDS.loadDatabase()
                            this.jewelriesDS.findOne({_id: propertyID}, function(err, jrecords) {
                                if(err)
                                    reject(err)
                                resolve(jrecords)
                            })
                        })
                        resolve(jewelries)
                    break;
                    default:
                        console.log('no propertyType')
                        reject({message: 'no propertyType'})
                }
            }
            catch(err){
                reject(err)
            }
        })
    }
    userDashBoard(cookies, params) {
        return new Promise(async (resolve, reject) => {
            try{
                if(!cookies.userRefToken)
                    return reject({message: 'expired cookies!'})

                const verify_user = await new Promise((resolve, reject) => {
                    jwt.verify(cookies.userRefToken, process.env.REFRESH_TOKEN, (err, decoded) => {
                        if(err)
                            reject({message: 'expired token'})
                        resolve(decoded)
                    })
                })
                const { request_type } = params
                
                switch(request_type) {
                    case 'assumed-and-posted-total':  // get the total of assumed and posted properties
                        const total_posted_properties = await new Promise(async (resolve, reject) => {
                            this.propertiesDS.loadDatabase()
                            this.accountDS.loadDatabase()
                            const account = await new Promise((resolve, reject) => {
                                this.accountDS.findOne({email: verify_user.email}, {user_id: 1}, function(err, accRec) {
                                    if(err)
                                        reject(err)
                                    resolve(accRec)
                                })
                            })
                            
                            this.propertiesDS.count({user_id: account.user_id}, function(err, totalRec) {
                                if(err)
                                    reject(err)
                                resolve(totalRec)
                            })
                        })
                        
                        const total_assumed_properties = await new Promise(async (resolve, reject) => {
                            const account = await new Promise((resolve, reject) => {
                                this.accountDS.loadDatabase()
                                this.accountDS.findOne({email: verify_user.email}, {user_id: 1}, function(err, accRec) {
                                    if(err)
                                        reject(err)
                                    resolve(accRec)
                                })
                            })

                            this.assumersDS.loadDatabase()
                            this.assumersDS.count({user_id: account.user_id}, function(err, assmrRec) {
                                if(err)
                                    reject(err)
                                resolve(assmrRec)
                            })
                        })
                        resolve({totalPosted: total_posted_properties, totalAssumed: total_assumed_properties})
                    break;
                    case 'data-inquiry':
                        const account = await new Promise((resolve, reject) => {
                            this.accountDS.loadDatabase()
                            this.accountDS.findOne({email: verify_user.email}, {user_id: 1}, function(err, accRec) {
                                if(err)
                                    reject(err)
                                resolve(accRec)
                            })
                        })
                        const properties = await new Promise((resolve, reject) => {
                            this.propertiesDS.loadDatabase()
                            this.propertiesDS.find({user_id: account.user_id}, function(err, propRec) {
                                if(err)
                                    reject(err)
                                resolve(propRec)
                            })
                        })

                        from(properties)
                            .pipe(
                                groupBy(property => property.property_type),
                                mergeMap(group$ => group$.pipe(reduce((acc, cur) => [...acc, cur], []))),
                                map(arr => ({ 
                                    key: arr[0].property_type, 
                                    total_assumer: arr.reduce((acc, curr) => acc+curr.assumption, 0), 
                                    total_posted: arr.length
                                })),
                                reduce((acc, curr) => [...acc, curr], [])
                            )
                            .subscribe(properties => resolve(properties))
                    break;
                    default:
                        console.log('no request_type')
                        reject({message: 'no request_type'})
                }
            }
            catch(err) {
                reject(err)
            }
        })
    }
    getProfile(cookies) {
        return new Promise(async (resolve, reject) => {
            try{
                const verify = await new Promise((resolve, reject) => {
                    jwt.verify(cookies.userRefToken, process.env.REFRESH_TOKEN, (err, decoded) => {
                        if(err)
                            reject(err)
                        resolve(decoded)
                    })
                })
                const account = await new Promise((resolve, reject) => {
                    this.accountDS.loadDatabase()
                    this.accountDS.findOne({email: verify.email}, {user_id: 1}, function(err, accRec) {
                        if(err)
                            reject(err)
                        resolve(accRec)
                    })
                })

                this.usersDS.loadDatabase()
                this.usersDS.findOne({_id: account.user_id}, {firstname: 1, middlename: 1, lastname: 1}, function(err, userRec) {
                    if(err)
                        reject(err)
                    resolve(userRec)
                })
            }
            catch(err) {
                reject(err)
            }
        })
    }
    getuserRecentChats(auth) {
        return new Promise(async (resolve, reject) => {
            try{
                const verifyAuth = await new Promise((resolve, reject) => {
                    jwt.verify(auth, process.env.PUBLIC_TOKEN, (err, decoded) => {
                        if(err)
                            reject(err)
                        resolve(decoded)
                    })
                })

                const userID = await new Promise((resolve, reject) => {
                    this.accountDS.loadDatabase()
                    this.accountDS.findOne({email: verifyAuth.email}, {user_id: 1}, function(err, accRec) {
                        if(err)
                            reject(err)
                        resolve(accRec)
                    })
                })

                this.messagesDS.loadDatabase()
                this.messagesDS.find(
                    {
                        $where: function() {
                            return (this.sender_id === userID.user_id || this.receiver_id === userID.user_id) 
                                && this.current == 1
                        }
                    },
                    function(err, messRec) {
                        if(err)
                            reject(err)
                        resolve(messRec)
                    }
                )
            }
            catch(err) {
                reject(err)
            }
        })
    }// get the active user-recently chatted with!
    iWantToChatWith(params) {
        return new Promise((resolve, reject) => {
            try{
                const { sender_id, receiver_id } = params
                this.messagesDS.loadDatabase()
                this.messagesDS.find({$or: [{sender_id: sender_id, receiver_id: receiver_id}, {sender_id: receiver_id, receiver_id: sender_id}]}, function(err, messRec) {
                    if(err)
                        reject(err)
                    resolve(messRec.sort((a,b )=> a.count-b.count))
                })
            }
            catch(err) {
                reject(err)
            }
        })
    }
    assumerIsOwner(token, propertyID) {
        return new Promise(async (resolve, reject) => {
            try{
                const activeUser = await new Promise((resolve, reject) => {
                    jwt.verify(token, process.env.PUBLIC_TOKEN, (err, decoded) => {
                        if(err)
                            reject(err)
                        this.accountDS.loadDatabase()
                        this.accountDS.findOne({email: decoded.email}, {user_id: 1}, function(err, accRec) {
                            if (err)
                                reject(err)
                            resolve(accRec)
                        })
                    })
                })

                // CHECK IF A PROPERTY WILL BE ASSUMED BY THE SAME USER
                const is_already_assumed_by_you = await new Promise((resolve, reject) => {
                    this.assumptionsDS.loadDatabase()
                    this.assumptionsDS.findOne(
                        {
                            $where: function() {
                                return this.property_id === propertyID && this.user_id === activeUser.user_id
                            }
                        }, function(err, assRec) {
                            if(err)
                                reject(err)
                            resolve(assRec)
                        }
                    )
                })
                
                if(is_already_assumed_by_you)
                    return reject({message: "you cant assume same property"})
                // END CHECK IF A PROPERTY WILL BE ASSUMED BY THE SAME USER

                this.propertiesDS.loadDatabase()
                this.propertiesDS.findOne({_id: propertyID}, {user_id: 1}, function(err, propRec) {
                    if(err)
                        reject(err)
                    
                    resolve({message: propRec.user_id === activeUser.user_id?"property owner":"user is not owner"})
                })
            }
            catch(err) {
                reject(err)
            }
        })
    }
    getAssumerInfo(params) {
        return new Promise(async (resolve, reject) => {
            try{
                const { email } = params

                const userID = await new Promise((resolve, reject) => {
                    this.accountDS.loadDatabase()
                    this.accountDS.findOne({email}, {user_id: 1}, function(err, accRec) {
                        if(err)
                            reject(err)
                        resolve(accRec)
                    })
                })

                this.usersDS.loadDatabase()
                this.usersDS.findOne({_id: userID.user_id}, {firstname: 1, middlename: 1, lastname: 1, 
                    contactno: 1, province: 1, municipality: 1, barangay: 1}, function(err, userRec) {
                        if(err)
                            reject(err)
                        resolve(userRec)
                    })
            }
            catch(err) {
                reject(err)
            }
        })
    }
    userSubmitAssumption(payloads) {
        return new Promise(async (resolve, reject) => {
            try{
                const { propertyID, firstname, middlename, lastname, contactno, work, income, city, province, barangay, message, email } = payloads

                const userID = await new Promise((resolve, reject) => {
                    this.accountDS.loadDatabase()
                    this.accountDS.findOne({email}, {user_id: 1}, function(err, accRec) {
                        if(err)
                            reject(err)
                        resolve(accRec)
                    })
                })  // the active user

                const assumer = await new Promise((resolve, reject) => {
                    this.assumersDS.loadDatabase()
                    this.assumersDS.insert({user_id: userID.user_id, assumer_income: income, assumer_work: work}, function(err, assRec) {
                        if(err)
                            reject(err)
                        resolve(assRec)
                    })
                })
                const date = new Date()
                const fullDate = `${date.getMonth()+1}/${date.getDate()}/${date.getFullYear()}`

                const assumption = await new Promise((resolve, reject) => {
                    this.assumptionsDS.loadDatabase()
                    this.assumptionsDS.insert({user_id: userID.user_id, property_id: propertyID, assumer_id: assumer._id, date: fullDate}, function(err, assRec) {
                        if(err)
                            reject(err)
                        resolve(assRec)
                    })
                })

                this.historyDS.loadDatabase()
                this.historyDS.insert({assumption_id: assumption._id, history_date: fullDate})
                this.notificationDS.loadDatabase()
                this.notificationDS.insert({user_id: userID.user_id, notification_type: "assumption of property"})

                if (/[^\s]/.test(message)){
                    const user_sender = await new Promise((resolve, reject) => {
                        this.usersDS.loadDatabase()
                        this.usersDS.findOne({_id: userID.user_id}, {firstname: 1, middlename: 1, lastname: 1}, function(err, userRec) {
                            if(err)
                                reject(err)
                            resolve(userRec)
                        })
                    })  // message sender

                    const user_receiver = await new Promise((resolve, reject) => {
                        this.propertiesDS.loadDatabase()
                        this.propertiesDS.findOne({_id: propertyID}, {user_id: 1}, function(err, userRec ){
                            if(err)
                                reject(err)
                            resolve(userRec)
                        })
                    })  // message_receiver OR the property_owner

                    const user_name_receiver = await new Promise((resolve, reject) => {
                        this.usersDS.loadDatabase()
                        this.usersDS.findOne({_id: user_receiver.user_id}, {firstname: 1, middlename: 1, lastname: 1}, function(err, userRec ){
                            if(err)
                                reject(err)
                            resolve(userRec)
                        })
                    })  // message_receiver OR the property_owner

                    const user_receiver_email = await new Promise((resolve, reject) => {
                        this.accountDS.loadDatabase()
                        this.accountDS.findOne({user_id: user_receiver.user_id}, {email: 1}, function(err, accRec) {
                            if(err)
                                reject(err)
                            resolve(accRec)
                        })
                    })

                    const currentMessage = await new Promise((resolve, reject) => {
                        this.messagesDS.loadDatabase()
                        this.messagesDS.findOne({
                            $where: function() {
                                return (this.sender_id === userID.user_id && this.receiver_id === user_receiver.user_id && this.current === 1) || 
                                    (this.sender_id === user_receiver.user_id && this.receiver_id === userID.user_id  && this.current === 1)
                            }
                        }, function(err, messRec) {
                            if(err)
                                reject(err)
                            resolve(messRec)
                        })
                    })

                    this.messagesDS.loadDatabase()

                    if(currentMessage)
                        this.messagesDS.update({_id: currentMessage._id}, {$set: {current: 0}})
                    
                    this.messagesDS.insert({sender_id: userID.user_id, sender_email: email, message_sender: `${user_sender.lastname}, ${user_sender.firstname}, ${user_sender.middlename}`, 
                        receiver_id: user_receiver.user_id, receiver_email: user_receiver_email.email, message_receiver: `${user_name_receiver.lastname}, ${user_name_receiver.firstname} ${user_name_receiver.middlename}`
                        , message, current: 1, message_date: fullDate})

                    this.messagesDS.loadDatabase()
                }
                resolve({message: "assumption of property was successfull!"})
            }
            catch(err) {
                reject(err)
            }
        })
    }  // it can also accept a message from assumer
    userSendMessageThroughProperties(params) {
        return new Promise(async (resolve, reject) => {
            try{
                const { propertyID, message, verified } = params

                if(!/[^\s]/.test(message))
                    return reject({message: "empty fields", has_error: true})

                const user_message_sender = await new Promise((resolve, reject) => {
                    this.accountDS.loadDatabase()
                    this.accountDS.findOne({email: verified.email}, {user_id: 1}, function(err, accRec) {
                        if(err)
                            reject(err)
                        resolve(accRec)
                    })
                })  // user-message-sender

                const user_sender = await new Promise((resolve, reject) => {
                    this.usersDS.loadDatabase()
                    this.usersDS.findOne({_id: user_message_sender.user_id}, {firstname: 1, middlename: 1, lastname: 1}, function(err, userRec) {
                        if(err)
                            reject(err)
                        resolve(userRec)
                    })
                })  // user-message-sender

                const user_message_receiver = await new Promise((resolve, reject) => {
                    this.propertiesDS.loadDatabase()
                    this.propertiesDS.findOne({_id: propertyID}, {user_id: 1}, function(err, propRec) {
                        if(err)
                            reject(err)
                        resolve(propRec)
                    })
                })  // user-message-receiver

                const user_account = await new Promise((resolve, reject) => {
                    this.accountDS.loadDatabase()
                    this.accountDS.findOne({user_id: user_message_receiver.user_id}, {email: 1, user_id: 1}, function(err, accRec) {
                        if(err)
                            reject(err)
                        resolve(accRec)
                    })
                })

                const user_receiver = await new Promise((resolve, reject) => {
                    this.usersDS.loadDatabase()
                    this.usersDS.findOne({_id: user_account.user_id}, {firstname: 1, middlename: 1, lastname: 1}, function(err, userRec) {
                        if(err)
                            reject(err)
                        resolve(userRec)
                    })
                })

                const currentMessage = await new Promise((resolve, reject) => {
                    this.messagesDS.loadDatabase()
                    this.messagesDS.findOne(
                        {
                            $where: function() {
                                return (this.sender_id === user_sender._id && this.receiver_id === user_receiver._id && this.current == 1)
                                    || (this.sender_id === user_receiver._id && this.receiver_id === user_sender._id && this.current == 1)
                            }
                        }, function(err, messRec) {
                            if(err)
                                reject(err)
                            resolve(messRec)
                        }
                    )
                })

                if(currentMessage)
                    this.messagesDS.update({_id: currentMessage._id}, {$set: {current: 0}})
                
                const date = new Date()
                const fullDate = `${date.getMonth()+1}/${date.getDate()}/${date.getFullYear()}`

                this.messagesDS.loadDatabase()
                const currentCounter = await new Promise((resolve, reject) => {
                    this.messagesDS.loadDatabase()
                    this.messagesDS.findOne(
                        {
                            $where: function () {
                                return (this.sender_id === user_sender._id || this.receiver_id === user_sender._id && this.current == 1)
                            }
                        }, function(err, currCount) {
                            if(err)
                                reject(err)
                            resolve(currCount)
                        }
                    )
                })
                console.log(currentCounter)
                // this.messagesDS.insert({
                //     sender_email: verified.email, sender_id: user_sender._id, message_sender: `${user_sender.lastname}, ${user_sender.firstname} ${user_sender.middlename}`,
                //     receiver_email: user_account.email, receiver_id: user_receiver._id, message_receiver: `${user_receiver.lastname}, ${user_receiver.firstname} ${user_receiver.middlename}`,
                //     message, current: 1, date: fullDate, count: currentMessage?parseInt(currentMessage.count)+1:0
                // })
                this.messagesDS.loadDatabase()
                resolve({message: "message sent", has_error: false})
            }
            catch(err) {
                reject(err)
            }
        })
    }
}
module.exports = { Users, Assumrs }