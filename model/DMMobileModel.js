const DataStore = require('nedb')
const bcrpypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const { from, switchMap, groupBy, mergeMap, reduce, map, async } = require('rxjs')

class MobileUsers{
    constructor(){
        this.propertiesDS = new DataStore({filename: './database/properties.db'})
        this.usersDS = new DataStore({filename: './database/users.db'})
        this.accountsDS = new DataStore({filename: './database/accounts.db'})
        this.assumersDS = new DataStore({filename: './database/assumers.db'})
        this.assumptionsDS = new DataStore({filename: './database/assumptions.db'})
        this.historiesDS = new DataStore({filename: './database/histories.db'})
        this.notificationsDS = new DataStore({filename: './database/notifications.db'})
        this.vehicleDS = new DataStore({filename: './database/vehicles.db'})
        this.vehicleImagesDS = new DataStore({filename: './database/vehicle_images.db'})
        this.jewelriesDS = new DataStore({filename: './database/jewelries.db'})
        this.realestatesDS = new DataStore({filename: './database/realestates.db'})
        this.halsDS = new DataStore({filename: './database/rhals.db'})
        this.housesDS = new DataStore({filename: './database/houses.db'})
        this.lotsDS = new DataStore({filename: './database/rlots.db'})
        this.feedbacksDS = new DataStore({filename: './database/feedbacks.db'})
        this.messagesDS = new DataStore({filename: './database/messages.db'})
    }
    signupUser(params){
        return new Promise(async (resolve, reject) => {
            const { firstname, middlename, lastname, contactno, gender, 
                province, municipality, barangay,
                username, password } = params

            const userID = await new Promise((resolve, reject) => {
                this.usersDS.loadDatabase()
                // this.usersDS.insert({
                //     firstname, middlename, lastname, contactno, gender,
                //     province, municipality, barangay}, function(err, records) {
                //         if(err)
                //             reject(err)
                //         resolve(records)
                // })
            })

            // const passHashed = await bcrpypt.hash(password, 10)
            // this.accountsDS.loadDatabase()
            // this.accountsDS.insert({user_id: userID._id, email: username, password: passHashed}, function(err, records) {
            //     if(err)
            //         reject(err)
            //     resolve({
            //         message: 'signup was successfull!'
            //     })
            // })
            resolve({
                message: 'tests'
            })
        })
    }
    signinUser(params){
        return new Promise((resolve, reject) => {
            const { username, password } = params

            this.accountsDS.loadDatabase()
            const response = new Promise((resolve, reject) => {
                this.accountsDS.findOne({email: username}, {user_id: 1, password: 1}, function(err, record) {
                    if(err)
                        reject(err)
                    resolve(record)
                })
            })
            from(response)
                .subscribe(async v => {
                    if(!v)
                        return reject({
                            message: 'invalid credentials',
                            accepted: false
                        })

                    const pwd = v.password
                    const samePass = await bcrpypt.compare(password, pwd)
                    
                    if(!samePass)
                        return reject({
                                message: 'invalid credentials',
                                accepted: false
                            })
                        
                    // const refreshToken = 
                    jwt.sign({email: username}, process.env.REFRESH_TOKEN, {expiresIn: 24*60*60*1000})
                    const accessToken = jwt.sign({email: username}, process.env.PUBLIC_TOKEN, {'expiresIn': '1d'})

                    resolve({
                        message: 'credentials accepted ',
                        user_id: v.user_id,
                        email: username,
                        accessToken,
                        // refreshToken,
                        accepted: true
                    })
                })
        })
    }
    assumerInfo(credentials) { 
        return new Promise(async (resolve, reject) => {
            try{
                const account = await new Promise((resolve, reject) => {
                    this.accountsDS.loadDatabase()
                    this.accountsDS.findOne({email: credentials['user']}, {user_id: 1}, function(err, accRecord) {
                        if(err)
                            reject(err)
                        resolve(accRecord)
                    })
                })

                this.usersDS.loadDatabase()
                this.usersDS.findOne({_id: account.user_id}, {
                    firstname: 1, middlename: 1, lastname: 1,
                    contactno: 1, province: 1, municipality: 1, barangay: 1
                }, function(err, userRecord) {
                    if(err)
                        reject(err)
                    resolve(userRecord)
                })
            }
            catch(err){
                reject(err)
            }
        })
    }
    submitAssumptionForm(params) {
        return new Promise(async (resolve, reject) => {
            try{
                const { propertyID, company, job, salary, email } = params
                
                const account = await new Promise((resolve, reject) => {
                    this.accountsDS.loadDatabase()
                    this.accountsDS.findOne({email}, {user_id: 1}, function(err, accountRecord) {
                        if(err)
                            reject(err)

                        resolve(accountRecord)
                    })
                })

                const assumer_is_owner = await new Promise((resolve, reject) => {
                    this.propertiesDS.loadDatabase()
                    this.propertiesDS.findOne({_id: propertyID}, {user_id: 1}, function(err, propRecord) {
                        if(err)
                            reject(err)
                        resolve(propRecord)
                    })
                })
                
                const already_assumed = await new Promise((resolve, reject) => {
                    this.assumptionsDS.loadDatabase()
                    this.assumptionsDS.find({$and: [{user_id: account.user_id}, {property_id: propertyID}]}, function(err, record) {
                        if(err)
                            reject(err)
                        resolve(record)
                    })
                })
                
                if(assumer_is_owner.user_id === account.user_id)
                    return reject({message: 'you cant assume your own property', has_error: true})
                //end of checking if assumer is owner
                else if(already_assumed.length > 0)
                    return reject({message: "you assumed this already!", has_error: true})

                const date = new Date()
                const now = `${date.getMonth()+1}/${date.getDate()}/${date.getFullYear()} ${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}`
                const assumer = await new Promise((resolve, reject) => {
                    this.assumersDS.loadDatabase()
                    this.assumersDS.insert({user_id: account.user_id, company, job, income: salary}, function(err, record) {
                        if(err)
                            reject(err)
                        resolve(record)
                    })
                })

                const owner = await new Promise(async (resolve, reject) => {
                    this.propertiesDS.loadDatabase()
                    const assumption = await new Promise((resolve, reject) => {
                        this.propertiesDS.findOne({_id: propertyID}, {assumption: 1}, function(err, propRec) {
                            if(err)
                                reject(err)
                            resolve(propRec)
                        })
                    })

                    this.propertiesDS.update({_id: propertyID}, {
                        $set: {assumption: assumption.assumption+1}
                    })

                    this.propertiesDS.findOne({_id: propertyID}, {user_id: 1}, function(err, record) {
                        if(err)
                            reject(err)
                        resolve(record)
                    })
                    this.propertiesDS.loadDatabase()
                })

                const assumption = await new Promise((resolve, reject) => {
                    this.assumptionsDS.loadDatabase()
                    this.assumptionsDS.insert({user_id: assumer.user_id, property_id: propertyID, 
                        assumer_id: assumer._id, transaction_date: now}, function(err, record) {
                            if(err)
                                reject(err)
                            resolve(record)
                        })
                })

                const notification = new Promise((resolve, reject) => {
                    this.notificationsDS.loadDatabase()
                    this.notificationsDS.insert({
                        notification_sender: assumer.user_id,
                        notification_receiver: owner.user_id,
                        notification_type: 'assumption of properties',
                        notification_status: 'unread'
                    })
                })

                resolve({message: 'assumption was successfull!', has_error: false})
            }
            catch(err){
                reject(err)
            }
        })
    }
    userUploadProperties(params, propImages) {
        return new Promise(async (resolve, reject) => {
            try{
                const { propertyType, email } = params
                var account = null;
                var property = null;
                var vehicle = null;
                var jewelry = null;
                var realestate = null

                switch(propertyType) {
                    case "vehicle":
                        const { vowner, vlocation, vcontactno, vtype, vmodel, vinstallmentpaid, vinstallmentduration,
                            vdelinquent, vdescription  } = params

                        account = await new Promise((resolve, reject) => {
                            this.accountsDS.loadDatabase()
                            this.accountsDS.findOne({email}, {user_id: 1}, function(err, accRec) {
                                if(err)
                                    reject(err)
                                resolve(accRec)
                            })
                        })

                        property = await new Promise((resolve, reject) => {
                            this.propertiesDS.loadDatabase()
                            this.propertiesDS.insert({property_type: propertyType, user_id: account.user_id, active: 1, assumption: 0}, function(err, propRec) {
                                if(err)
                                    reject(err)
                                resolve(propRec)
                            })
                        })
                        
                        vehicle = await new Promise((resolve, reject) => {
                            this.vehicleDS.loadDatabase()
                            this.vehicleDS.insert({vehicle_owner: vowner,vehicle_name: vtype, vehicle_location: vlocation, contactno: vcontactno, 
                                vehicle_model: vmodel, vehicle_installmentpaid: vinstallmentpaid, 
                                vehicle_installmentduration: vinstallmentduration, delinquent: vdelinquent, 
                                description: vdescription, property_id: property._id}, function(err, vRec) {
                                    if(err)
                                        reject(err)
                                    resolve(vRec)
                                })
                        })
                        this.vehicleImagesDS.loadDatabase()
                        this.vehicleImagesDS.insert({vehicle_id: vehicle._id, images: propImages})

                        resolve({message: 'uploading of properties was successfull!', has_error: false})
                    break;
                    case "realestate":
                        const { realType, rowner, rlocation, rcontactno, rdeveloper, rinstallmentpaid, rinstallmentduration, 
                            rdelinquent, rdescription } = params
                        
                        account = await new Promise((resolve, reject) => {
                            this.accountsDS.loadDatabase()
                            this.accountsDS.findOne({email}, {user_id: 1}, function(err, accRec) {
                                if(err)
                                    reject(err)
                                resolve(accRec)
                            })
                        })

                        property = await new Promise((resolve, reject) => {
                            this.propertiesDS.loadDatabase()
                            this.propertiesDS.insert({property_type: propertyType, user_id: account.user_id, active: 1, assumption: 0}, function(err, propRec) {
                                if(err)
                                    reject(err)
                                resolve(propRec)
                            })
                        })
                        realestate = await new Promise((resolve, reject) => {
                            this.realestatesDS.loadDatabase()
                            this.realestatesDS.insert({realestate_owner: rowner, realestate_contactno: rcontactno, realestate_type: realType, 
                                realestate_location: rlocation, realestate_installmentpaid: rinstallmentpaid, realestate_installmentduration: rinstallmentduration,
                                realestate_delinquent: rdelinquent, realestate_description: rdescription, property_id: property._id}, function(err, record) {
                                    if(err)
                                        reject(err)
                                    resolve(record)
                                })
                        })
                        switch(realType){
                            case 'house and lot':
                                this.halsDS.loadDatabase()
                                this.halsDS.insert({hal_developer: rdeveloper, images: propImages, realestate_id: realestate._id})
                            break;
                            case 'house':
                                this.housesDS.loadDatabase()
                                this.housesDS.insert({house_developer: rdeveloper, images: propImages, realestate_id: realestate._id})
                            break;
                            case 'lot':
                                this.lotsDS.loadDatabase()
                                this.lotsDS.insert({images: propImages, realestate_id: realestate._id})
                            break;
                            default:
                                console.log('no realType')
                                return reject({message: 'no realType', has_error: true})
                        }

                        resolve({message: 'uploading of properties was successfull!', has_error: false})
                    break;
                    case "jewelry":
                        const { jowner, jcontactno, jlocation, jname, jtype, jinstallmentpaid, 
                            jinstallmentduration, jdelinquent, jdescription } = params

                        account = await new Promise((resolve, reject) => {
                            this.accountsDS.loadDatabase()
                            this.accountsDS.findOne({email}, {user_id: 1}, function(err, accRec) {
                                if(err)
                                    reject(err)
                                resolve(accRec)
                            })
                        })

                        property = await new Promise((resolve, reject) => {
                            this.propertiesDS.loadDatabase()
                            this.propertiesDS.insert({property_type: propertyType, user_id: account.user_id, active: 1, assumption: 0}, function(err, propRec) {
                                if(err)
                                    reject(err)
                                resolve(propRec)
                            })
                        })
                        
                        jewelry = await new Promise((resolve, reject) => {
                            this.jewelriesDS.loadDatabase()
                            this.jewelriesDS.insert({jewelry_owner: jowner,jewelry_contactno: jcontactno, jewelry_location: jlocation, 
                                jewelry_name: jname, jewelry_type: jtype, jewelry_installmentpaid: jinstallmentpaid, 
                                jewelry_installmentduration: jinstallmentduration, jewelry_delinquent: jdelinquent, 
                                jewelry_description: jdescription, images: propImages, property_id: property._id}, function(err, jRec) {
                                    if(err)
                                        reject(err)
                                    resolve(jRec)
                                })
                        })

                        resolve({message: 'uploading of properties was successfull!', has_error: false})

                    break;
                    default:
                        console.log('no propertyType')
                        reject({ message: 'no propertyType', has_error: true})
                }
            }
            catch(err) {
                reject(err)
            }
        })
    }
    userSendMessage(params) {
        return new Promise(async (resolve, reject) => {
            try{
                const { message_receiver, receiver_id, message, email_sender } = params
                
                if(!/[^\s]/.test(message))
                    return reject({message: 'empty message', has_error: true})
                
                const user_sender = await new Promise(async(resolve, reject) => {
                    this.accountsDS.loadDatabase()
                    this.usersDS.loadDatabase()
                    const accountUSERID = await new Promise((resolve, reject) => {
                        this.accountsDS.findOne({email: email_sender}, {user_id: 1}, function(err, accRec) {
                            if(err)
                                reject(err)
                            resolve(accRec)
                        })
                    })
                    const user = await new Promise((resolve, reject) => {
                        this.usersDS.findOne({_id: accountUSERID.user_id}, {firstname: 1, middlename: 1, lastname: 1}, function(err, userRec) {
                            if(err)
                                reject(err)
                            resolve(userRec)
                        })
                    })
                    resolve(user)
                })

                const message_sender = `${user_sender.lastname}, ${user_sender.firstname} ${user_sender.middlename}`
        
                const currentMessage = await new Promise((resolve, reject) => {
                    this.messagesDS.loadDatabase()
                    this.messagesDS.findOne({
                        $where: function() {
                            return (this.sender_id === user_sender._id && this.receiver_id === receiver_id && this.current === 1) || 
                                (this.sender_id === receiver_id && this.receiver_id === user_sender._id  && this.current === 1)
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
                this.messagesDS.insert({sender_id: user_sender._id, message_sender, receiver_id, message_receiver, message, current: 1})
                this.messagesDS.loadDatabase()

                resolve({message: 'message sent!', has_error: false})
            }
            catch(err) {
                reject(err)
            }
        })
    } // user send message through assumption form
    userFeedBacks(params) {
        return new Promise(async (resolve, reject) => {
            try{
                const { feedback, email } = params
                
                const date = new Date()
                const fullDate = `${date.getMonth()+1}/${date.getDate()}/${date.getFullYear()}`

                if (!/[^\s]/.test(feedback))
                    return reject({message: 'empty fields', has_error: true})

                const userID = await new Promise((resolve, reject) => {
                    this.accountsDS.loadDatabase()
                    this.accountsDS.findOne({email}, {user_id: 1}, function(err, accRec) {
                        if(err)
                            reject(err)
                        resolve(accRec)
                    })
                })

                this.feedbacksDS.loadDatabase()
                this.feedbacksDS.insert({user_id: userID.user_id, user_feedbacks: feedback, feedback_date: fullDate})
                this.feedbacksDS.loadDatabase()

                resolve({message: 'Your feedbacks has been send!', has_error: false})
            }
            catch(err) {
                reject(err)
            }
        })
    }
    getUserFeedBacks() {
        return new Promise(async (resolve, reject) => {
            try{
                const feedbacks = await new Promise((resolve, reject) => {
                    this.feedbacksDS.loadDatabase()
                    this.feedbacksDS.find({}, function(err, feedRec) {
                        if(err)
                            reject(err)
                        resolve(feedRec)
                    })
                })

                feedbacks.map(async feedback => {
                    const user = await new Promise((resolve, reject) => {
                        this.usersDS.loadDatabase()
                        this.usersDS.findOne({_id: feedback.user_id}, {firstname: 1, middlename: 1, lastname: 1}, function(err, userRec) {
                            if(err)
                                reject(err)
                            resolve(userRec)
                        })
                    })
                    if(user)
                        feedback.user = user
                })

                setTimeout(() => {
                    resolve({feedbacks, has_error: false})
                }, 1000)
            }
            catch(err) {
                reject(err)
            }
        })
    }
    myTolalPosted_AssumedProperties(params) {
        return new Promise(async (resolve, reject) => {
            try{
                const { email } = params
                const account = await new Promise((resolve, reject) => {
                    this.accountsDS.loadDatabase()
                    this.accountsDS.findOne({email: email}, {user_id: 1}, function(err, accRec) {
                        if(err)
                            reject(err)
                        resolve(accRec)
                    })
                })

                const total_posted_property = await new Promise((resolve, reject) => {
                    this.propertiesDS.loadDatabase()
                    this.propertiesDS.count({user_id: account.user_id}, function(err, countedPosted) {
                        if(err)
                            reject(err)
                        resolve(countedPosted)
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
                // end of total posted properties
                
                const total_assumed_property = await new Promise((resolve, reject) => {
                    this.assumersDS.loadDatabase()
                    this.assumersDS.count({user_id: account.user_id}, function(err, countedAssmed) {
                        if(err)
                            reject(err)
                        resolve(countedAssmed)
                    })
                })
                // end of total assumed properties
                let data = []
                let total = -1
                from(properties)
                    .pipe(
                        groupBy(properties => properties.property_type),
                        mergeMap(group$ => group$.pipe(reduce((acc, curr) => [...acc, curr], [`${group$.key}`]))),
                        map(arr => ({total: total+arr.length, prop: arr.slice()[1]}))
                    ).subscribe(v => data.push(v))
                resolve({property: data, total_posted_property, total_assumed_property})
            } // end of try
            catch(err){
                reject({message: err, has_error: true})
            }
        })
    } //# it gets the active user total posted properties and also their total assumed properties
    myPostedProperties(params) {
        return new Promise(async (resolve, reject) => {
            try{
                const { propertyType, email } = params
                const account = await new Promise((resolve, reject) => {
                    this.accountsDS.loadDatabase()
                    this.accountsDS.findOne({email}, {user_id: 1}, function(err, accRec) {
                        if(err)
                            reject(err)
                        resolve(accRec)
                    })
                })
                let properties = null

                switch(propertyType) {
                    case "vehicles":
                        properties = await new Promise((resolve, reject) => {
                            this.propertiesDS.loadDatabase()
                            this.propertiesDS.find(
                                {
                                    $where: function() {
                                        return this.property_type === propertyType.replace(/s/, '') && this.active == 1 && this.user_id === account.user_id
                                    }
                                }, function(err, records) {
                                    if(err)
                                        reject(err)
                                    resolve(records)
                                }
                            )
                        })

                        properties.map(async property => {
                            const vehicle = await new Promise(async(resolve, reject) => {
                                this.vehicleDS.loadDatabase()
                                this.vehicleDS.findOne({property_id: property._id}, function(err, vRec) {
                                    if(err)
                                        reject(err)
                                    resolve(vRec)
                                })
                            })

                            if (vehicle != null){
                                const vimage = await new Promise((resolve, reject) => {
                                    this.vehicleImagesDS.loadDatabase()
                                    this.vehicleImagesDS.findOne({vehicle_id: vehicle._id}, function(err, vimgRec) {
                                        if(err)
                                            reject(vimgRec)
                                        resolve(vimgRec)
                                    })
                                })
                                vehicle.vimg = vimage
                                property.vehicle = vehicle
                            }

                            return property
                        })
                        
                        setTimeout(() => {
                            resolve(properties)
                        }, 1000)
                    break;
                    case "realestates":
                        properties = await new Promise((resolve, reject) => {
                            this.propertiesDS.loadDatabase()
                            this.propertiesDS.find({$and: [{user_id: account.user_id},
                                    {property_type: propertyType.replace(/s$/, '')},
                                    {active: 1}]}, function(err, record) {
                                if(err)
                                    reject(err)
                                resolve(record)
                            })
                        })
                        properties.map(async property => {
                            const realestates = await new Promise((resolve, reject) => {
                                this.realestatesDS.loadDatabase()
                                this.realestatesDS.findOne({property_id: property._id}, function(err, realRec) {
                                    if(err)
                                        reject(err)
                                    resolve(realRec)
                                })
                            })
                            const realType = realestates.realestate_type

                            switch(realType) {
                                case 'house and lot':
                                    const hals = await new Promise((resolve, reject) => {
                                        this.halsDS.loadDatabase()
                                        this.halsDS.findOne({realestate_id: realestates._id}, function(err, halRec) {
                                            if(err)
                                                reject(err)
                                            resolve(halRec)
                                        })
                                    })
                                    realestates.realType = hals
                                    property.realestate = realestates
                                break;
                                case 'house':
                                    const houses = await new Promise((resolve, reject) => {
                                        this.housesDS.loadDatabase()
                                        this.housesDS.findOne({realestate_id: realestates._id}, function(err, houseRec) {
                                            if(err)
                                                reject(err)
                                            resolve(houseRec)
                                        })
                                    })
                                    realestates.realType = houses
                                    property.realestate = realestates
                                break;
                                case 'lot':
                                    const lots = await new Promise((resolve, reject) => {
                                        this.lotsDS.loadDatabase()
                                        this.lotsDS.findOne({realestate_id: realestates._id}, function(err, lotRec) {
                                            if(err)
                                                reject(err)
                                            resolve(lotRec)
                                        })
                                    })
                                    realestates.realType = lots
                                    property.realestate = realestates
                                break;
                                default:
                                    console.log('no realType')
                            }
                        })
                        
                        setTimeout(() => {
                            resolve(properties)
                        }, 1000)
                        
                    break;
                    case "jewelries":
                        properties = await new Promise((resolve, reject) => {
                            this.propertiesDS.loadDatabase()
                            this.propertiesDS.find(
                                {
                                    $where: function() {
                                        return this.property_type === 'jewelry' && this.active == 1 && this.user_id === account.user_id
                                    }
                                }, function(err, propRecord) {
                                    if(err)
                                        reject(err)
                                    resolve(propRecord)
                                }
                            )
                        })
                        properties.map(async property => {
                            const jewelries = await new Promise((resolve, reject) => {
                                this.jewelriesDS.loadDatabase()
                                this.jewelriesDS.findOne({property_id: property._id}, function(err, jRecord) {
                                    if(err)
                                        reject(err)
                                    resolve(jRecord)
                                })
                            })
                            property.jewelry = jewelries
                        })
                        
                        setTimeout(() => {
                            resolve(properties)
                        }, 1000)
                    break;
                    default:
                        console.log('no propertyType')
                        reject({message: 'no propertyType', has_error: true})
                }

            }
            catch(err){
                reject(err)
            }
        })
    } // all user posted properties
    myCertainRealestateType(params) {
        return new Promise(async (resolve, reject) => {
            try{
                var account = null; var properties = null
                const { realestateType, email } = params

                switch(realestateType) {
                    case 'house and lot':
                        account = await new Promise((resolve, reject) => {
                            this.accountsDS.loadDatabase()
                            this.accountsDS.findOne({email: email}, {user_id: 1}, function(err, accRec) {
                                if(err)
                                    reject(err)
                                resolve(accRec)
                            })
                        })
                        properties = await new Promise((resolve, reject) => {
                            this.propertiesDS.loadDatabase()
                            this.propertiesDS.find({user_id: account.user_id}, function(err, propRec) {
                                if(err)
                                    reject(err)
                                resolve(propRec)
                            })
                        })
                        var data = []
                        properties.map(async property => {
                            const realestate = await new Promise((resolve, reject) => {
                                this.realestatesDS.loadDatabase()
                                this.realestatesDS.findOne({
                                    $and: [{property_id: property._id}, {realestate_type: realestateType}]
                                }, function(err, realRec) {
                                    if(err)
                                        reject(err)
                                    resolve(realRec)
                                })
                            })
                            if(realestate){ // if not null
                                const hal = await new Promise((resolve, reject) => {
                                    this.halsDS.loadDatabase()
                                    this.halsDS.findOne({realestate_id: realestate._id}, function(err, halRec) {
                                        if(err)
                                            reject(err)
                                        resolve(halRec)
                                    })
                                })
                                realestate.realType = hal
                                data.push({_id: property._id, realestate})
                            }
                            return
                        })

                        setTimeout(() => {
                            resolve(data)
                        }, 1000)
                        
                    break;
                    case 'house':
                        account = await new Promise((resolve, reject) => {
                            this.accountsDS.loadDatabase()
                            this.accountsDS.findOne({email: email}, {user_id: 1}, function(err, accRec) {
                                if(err)
                                    reject(err)
                                resolve(accRec)
                            })
                        })
                        properties = await new Promise((resolve, reject) => {
                            this.propertiesDS.loadDatabase()
                            this.propertiesDS.find({user_id: account.user_id}, function(err, propRec) {
                                if(err)
                                    reject(err)
                                resolve(propRec)
                            })
                        })
                        var data = []
                        properties.map(async property => {
                            const realestate = await new Promise((resolve, reject) => {
                                this.realestatesDS.loadDatabase()
                                this.realestatesDS.findOne({
                                    $and: [{property_id: property._id}, {realestate_type: realestateType}]
                                }, function(err, realRec) {
                                    if(err)
                                        reject(err)
                                    resolve(realRec)
                                })
                            })
                            if(realestate){ // if not null
                                const house = await new Promise((resolve, reject) => {
                                    this.housesDS.loadDatabase()
                                    this.housesDS.findOne({realestate_id: realestate._id}, function(err, halRec) {
                                        if(err)
                                            reject(err)
                                        resolve(halRec)
                                    })
                                })
                                realestate.realType = house
                                data.push({_id: property._id, realestate})
                            }
                            return
                        })

                        setTimeout(() => {
                            resolve(data)
                        }, 1000)
                    break;
                    case 'lot':
                        account = await new Promise((resolve, reject) => {
                            this.accountsDS.loadDatabase()
                            this.accountsDS.findOne({email: email}, {user_id: 1}, function(err, accRec) {
                                if(err)
                                    reject(err)
                                resolve(accRec)
                            })
                        })
                        properties = await new Promise((resolve, reject) => {
                            this.propertiesDS.loadDatabase()
                            this.propertiesDS.find({user_id: account.user_id}, function(err, propRec) {
                                if(err)
                                    reject(err)
                                resolve(propRec)
                            })
                        })
                        var data = []
                        properties.map(async property => {
                            const realestate = await new Promise((resolve, reject) => {
                                this.realestatesDS.loadDatabase()
                                this.realestatesDS.findOne({
                                    $and: [{property_id: property._id}, {realestate_type: realestateType}]
                                }, function(err, realRec) {
                                    if(err)
                                        reject(err)
                                    resolve(realRec)
                                })
                            })
                            if(realestate){ // if not null
                                const lot = await new Promise((resolve, reject) => {
                                    this.lotsDS.loadDatabase()
                                    this.lotsDS.findOne({realestate_id: realestate._id}, function(err, halRec) {
                                        if(err)
                                            reject(err)
                                        resolve(halRec)
                                    })
                                })
                                realestate.realType = lot
                                data.push({_id: property._id, realestate})
                            }
                            return
                        })

                        setTimeout(() => {
                            resolve(data)
                        }, 1000)
                    break;
                    default:
                        console.log('no realType')
                        reject({ message: 'no realType', has_error: true})
                }
            }
            catch(err){
                reject(err)
            }
        })
    }
    myCertainPostedProperties(params) {
        return new Promise(async (resolve, reject) => {
            try{
                const { propertyID, propertyType } = params
                switch(propertyType) {
                    case "vehicle":
                        const vehicle = await new Promise((resolve, reject) => {
                            this.vehicleDS.loadDatabase()
                            this.vehicleDS.findOne({property_id: propertyID}, function(err, vrecord) {
                                if(err)
                                   return  reject(err)
                                resolve(vrecord)
                            })
                        })
                        const vimage = await new Promise((resolve, reject) => {
                            this.vehicleImagesDS.loadDatabase()
                            this.vehicleImagesDS.findOne({vehicle_id: vehicle._id}, function(err, vimgRec) {
                                if(err)
                                    reject(err)
                                resolve(vimgRec)
                            })
                        })
                        vehicle.vimg = vimage
                        vehicle.has_error = false

                        resolve(vehicle)
                    break;
                    case "realestate":
                        const property = await new Promise((resolve, reject) => {
                            this.propertiesDS.loadDatabase()
                            this.propertiesDS.findOne({_id: propertyID}, function(err, propRec) {
                                if(err)
                                    reject(err)
                                resolve(propRec)
                            })
                        })
                        const realestate = await new Promise((resolve, reject) => {
                            this.realestatesDS.loadDatabase()
                            this.realestatesDS.findOne({property_id: property._id}, function(err, realRec) {
                                if(err)
                                    reject(err)
                                resolve(realRec)
                            })
                        })
                        switch(realestate.realestate_type){
                            case 'house and lot':
                                const hal = await new Promise((resolve, reject) => {
                                    this.halsDS.loadDatabase()
                                    this.halsDS.findOne({realestate_id: realestate._id}, function(err, halRec) {
                                        if(err)
                                            reject(err)
                                        resolve(halRec)
                                    })
                                })
                                realestate.realProp = hal
                                property.realestate = realestate
                            break;
                            case 'house':
                                const house = await new Promise((resolve, reject) => {
                                    this.housesDS.loadDatabase()
                                    this.housesDS.findOne({realestate_id: realestate._id}, function(err, houseRec) {
                                        if(err)
                                            reject(err)
                                        resolve(houseRec)
                                    })
                                })
                                realestate.realProp = house
                                property.realestate = realestate
                            break;
                            case 'lot':
                                const lot = await new Promise((resolve, reject) => {
                                    this.lotsDS.loadDatabase()
                                    this.lotsDS.findOne({realestate_id: realestate._id}, function(err, lotRec) {
                                        if(err)
                                            reject(err)
                                        resolve(lotRec)
                                    })
                                })
                                realestate.realProp = lot
                                property.realestate = realestate
                            break;
                            default:
                                console.log('no realestateType')
                        }
                        resolve(property)
                    break;
                    case "jewelry":
                        const jewelry = new Promise((resolve, reject) => {
                            this.jewelriesDS.loadDatabase()
                            this.jewelriesDS.findOne({property_id: propertyID}, function(err, jRecord) {
                                if (err)
                                    reject(err)
                                resolve(jRecord)
                            })
                        })

                        resolve(jewelry)
                    break;
                    default:
                        console.log('no propertyType')
                        reject({
                            message: "no propertyType",
                            has_error: true
                        })
                }
            }
            catch(err) {
                reject(err)
            }
        })
    }
    dropMyPostedProperties(params) {
        return new Promise((resolve, reject) => {
            try{
                const { propertyID } = params

                const properties = new Promise((resolve, reject) => {
                    this.propertiesDS.loadDatabase()
                    this.propertiesDS.update({_id: propertyID}, {$set: {"active": 0}}, function(err, numReplaced) {
                        if(err)
                            reject(err)
                        return
                    })
                })
                this.propertiesDS.loadDatabase()

                resolve({
                    message: "property was dropped successfully!",
                    has_error: false
                })
            }
            catch(err) {
                reject(err)
            }
        })
    }//used by all properties (i don't know what this for -_-)
    toUpdateMyPostedProperties(params) {
        return new Promise(async (resolve, reject) => {
            try{
                const { propertyID } = params

                const property = await new Promise((resolve, reject) => {
                    this.propertiesDS.loadDatabase()
                    this.propertiesDS.findOne({_id: propertyID}, function(err, propRecord) {
                        if(err)
                            reject(err)
                        resolve(propRecord)
                    })
                })

                const vehicle = await new Promise((resolve, reject) => {
                    this.vehicleDS.loadDatabase()
                    this.vehicleDS.findOne({property_id: property._id}, function(err, vRecord) {
                        if(err)
                            reject(err)
                        resolve(vRecord)
                    })
                })

                const vimage = await new Promise((resolve, reject) => {
                    this.vehicleImagesDS.loadDatabase()
                    this.vehicleImagesDS.findOne({vehicle_id: vehicle._id}, function(err, imgRecord) {
                        if(err)
                            reject(err)
                        resolve(imgRecord)
                    })
                })

                vehicle.vimg = vimage

                resolve(vehicle)
            }
            catch(err) {
                reject(err)
            }
        })
    } //get certainProperties to be updated
    updateMyPostedProperties(params) {
        return new Promise((resolve, reject) => {
            try{
                const { propertyID, propertyType } = params
                let isValid = {}

                switch(propertyType) {
                    case 'vehicle':
                        const { vowner, vcontactno, vlocation, vvehicle, vmodel, vinstallmentpaid, vinstallmentduration, 
                            vdelinquent, vdescription } = params

                        isValid = {
                            message: /[^\s]/.test(vowner)?/[^\s]/.test(vcontactno)?/[^\s]/.test(vlocation)?/[^\s]/.test(vvehicle)?/[^\s]/.test(vmodel)?
                                /[^\s]/.test(vinstallmentpaid)?/[^\s]/.test(vinstallmentduration)?/[^\s]/.test(vdelinquent)?
                                /[^\s]/.test(vdescription)?'':'description is empty':'delinquent is empty'
                                :'installmentduration is empty':'installmentpaid is empty':'vehicle-model is empty':'vehicle-type is empty'
                                :'location is empty':'contactno is empty': 'owner is empty',
                            has_error: /[^\s]/.test(vowner)?/[^\s]/.test(vcontactno)?/[^\s]/.test(vlocation)?/[^\s]/.test(vvehicle)?
                                /[^\s]/.test(vmodel)?/[^\s]/.test(vinstallmentpaid)?/[^\s]/.test(vinstallmentduration)?
                                /[^\s]/.test(vdelinquent)?/[^\s]/.test(vdescription)?false:true:true:true:true:true:true:true:true:true
                        }
                        
                        if(isValid.has_error)
                            return reject(isValid)
        
                        this.vehicleDS.loadDatabase()
                        this.vehicleDS.update({property_id: propertyID}, {$set: {
                            vehicle_owner: vowner, vehicle_name: vvehicle, contactno: vcontactno, vehicle_location: vlocation,
                            vehicle_model: vmodel, vehicle_installmentpaid: vinstallmentpaid, vehicle_installmentduration: vinstallmentduration,
                            delinquent: vdelinquent, description: vdescription
                        }}, {}, function(err, numReplaced) {
                            if(err)
                                reject(err)
                            return
                        })
                        this.vehicleDS.loadDatabase()
                        resolve({
                            message: "updating was successfull!",
                            has_error: false
                        })
                    break;
                    case 'jewelry':
                        const { jowner, jcontactno, jlocation, jname, jtype, jinstallmentpaid, 
                            jinstallmentduration, jdelinquent, jdescription } = params

                        isValid = {
                            message: /[^\s]/.test(jowner)?/[^\s]/.test(jcontactno)?/[^\s]/
                                .test(jlocation)?/[^\s]/.test(jname)?/[^\s]/.test(jtype)?/[^\s]/
                                .test(jinstallmentpaid)?/[^\s]/.test(jinstallmentduration)?/[^\s]/
                                .test(jdelinquent)?/[^\s]/.test(jdescription)?'': 'empty description':'empty delinquent':'empty installmentduration'
                                :'empty installmentpaid':'empty jewelry type':'empty jewelryname':'empty location':'empty contactno':'empty owner',
                            has_error: /[^\s]/.test(jowner)?/[^\s]/.test(jcontactno)?/[^\s]/.test(jlocation)?
                                /[^\s]/.test(jname)?/[^\s]/.test(jtype)?/[^\s]/.test(jinstallmentpaid)?
                                /[^\s]/.test(jinstallmentduration)?/[^\s]/.test(jdelinquent)?/[^\s]/.test(jdescription)?
                                false:true:true:true:true:true:true:true:true:true
                        }
                        if (isValid.has_error)
                            return reject(isValid)
                        this.jewelriesDS.loadDatabase()
                        this.jewelriesDS.update({property_id: propertyID}, {
                            $set: { jewelry_owner: jowner, jewelry_contactno: jcontactno ,
                                    jewelry_location: jlocation, jewelry_name: jname, jewelry_type: jtype, jewelry_installmentpaid: jinstallmentpaid, 
                                    jewelry_installmentduration: jinstallmentduration, jewelry_delinquent: jdelinquent, 
                                    jewelry_description: jdescription }
                        }, function(err, numReplaced) {
                                if (err)
                                    reject(err)
                                return
                            })
                        this.jewelriesDS.loadDatabase()

                        resolve({message: 'updating was sucessfull!', has_error: false})
                    break;
                    case 'realestate':
                        const { realID, realestateType } = params

                        const { rowner, rcontactno, rlocation, rproperty_type, rdeveloper, rinstallmentpaid, rinstallmentduration,
                            rdelinquent, rdescription } = params
                        
                        switch(realestateType){
                            case "house and lot":
                                this.realestatesDS.loadDatabase()
                                this.realestatesDS.update({_id: realID}, {
                                    $set: {realestate_owner: rowner, realestate_contactno: rcontactno, realestate_location: rlocation, 
                                        realestate_installmentpaid: rinstallmentpaid, realestate_installmentduration: rinstallmentduration, 
                                        realestate_delinquent: rdelinquent, realestate_description: rdescription}
                                })

                                this.halsDS.loadDatabase()
                                this.halsDS.update({realestate_id: realID}, {
                                    $set: {hal_developer: rdeveloper}
                                })
                                this.realestatesDS.loadDatabase()
                                this.halsDS.loadDatabase()
                                resolve({message: 'updating was sucessfull!', has_error: false})
                            break;
                            case "house":
                                //code for update
                            break;
                            case "lot":
                                this.realestatesDS.loadDatabase()
                                this.realestatesDS.update({_id: realID}, {
                                    $set: {realestate_owner: rowner, realestate_contactno: rcontactno, realestate_location: rlocation, 
                                        realestate_installmentpaid: rinstallmentpaid, realestate_installmentduration: rinstallmentduration, 
                                        realestate_delinquent: rdelinquent, realestate_description: rdescription}
                                })
                                this.realestatesDS.loadDatabase()
                                resolve({message: 'updating was sucessfull!', has_error: false})
                            break;
                            default:
                                console.log("no realestateType")
                        }
                    break;
                    default:
                        console.log('no propertyType')
                        reject({message: 'no propertyType', has_error: true})
                }
            }
            catch(err) {
                reject(err)
            }
        })
    }//this update your properties
}

class MobileAssumrs {
    constructor(){
        this.accountsDS = new DataStore({filename: './database/accounts.db'})
        this.usersDS = new DataStore({filename: './database/users.db'})
        this.propertiesDS = new DataStore({filename: './database/properties.db'})
        this.vehicleDS = new DataStore({filename: './database/vehicles.db'})
        this.vehicleImagesDS = new DataStore({filename: './database/vehicle_images.db'})
        this.realestatesDS = new DataStore({filename: './database/realestates.db'})
        this.halsDS = new DataStore({filename: './database/rhals.db'})
        this.housesDS = new DataStore({filename: './database/rhouses.db'})
        this.lotsDS = new DataStore({filename: './database/rlots.db'})
        this.jewelriesDS = new DataStore({filename: './database/jewelries.db'})
        this.messagesDS = new DataStore({filename: './database/messages.db'})
    }
    retrieveVehiclesForAssumption() {
        return new Promise(async (resolve, reject) => {
            try{
                const vehicles = await new Promise((resolve, reject) => {
                    this.vehicleDS.loadDatabase()
                    this.vehicleDS.find({}, function(err, vrecords) {
                        if(err)
                            reject(err)
                        resolve(vrecords)
                    })
                })
                
                const images = await new Promise((resolve, reject) => {
                    this.vehicleImagesDS.loadDatabase()
                    this.vehicleImagesDS.find({}, function(err, irecords) {
                        if(err)
                            reject(err)
                        resolve(irecords)
                    })
                })
    
                vehicles.filter(vehicle => {
                    images.map(image => {
                        if(image.vehicle_id === vehicle._id)
                            vehicle.images = image
                    })
                })
                
                resolve(vehicles)
            }
            catch(err){
                reject(err)
            }
        })
    }
    retrieveJewelriesForAssumption() {
        return new Promise(async (resolve, reject) => {
            try{
                const jewelries = await new Promise((resolve, reject) => {
                    this.jewelriesDS.loadDatabase()
                    this.jewelriesDS.find({}, function(err, jrecords) {
                        if(err)
                            reject(err)
                        resolve(jrecords)
                    })
                })
                
                resolve(jewelries)
            }
            catch(err) {
                reject(err)
            }
        })
    }
    getCertainVehicle(vehicleID) {
        return new Promise((resolve, reject) => {
            try{
                const vehicle = new Promise((resolve, reject) => {
                    this.vehicleDS.loadDatabase()
                    this.vehicleDS.findOne({_id: vehicleID}, function(err, vrecrod) {
                        if(err)
                            reject(err)
                        resolve(vrecrod)
                    })
                })

                from(vehicle)
                    .pipe(
                        switchMap(async vehicle => {
                            const vimage = await new Promise((resolve, reject) => {
                                this.vehicleImagesDS.loadDatabase()
                                this.vehicleImagesDS.findOne({vehicle_id: vehicle._id}, function(err, vimg) {
                                    if(err)
                                        reject(err)
                                    resolve(vimg)
                                })
                            })
                            
                            vehicle.img = vimage

                            return vehicle
                        })
                    )
                .subscribe(response => resolve(response))
            }
            catch(err) {
                reject(err)
            }
        })
    }
    getCertainJewelry(jewelryID) {
        return new Promise(async (resolve, reject) => {
            try{
                const jewelry = await new Promise((resolve, reject) => {
                    this.jewelriesDS.loadDatabase()
                    this.jewelriesDS.findOne({_id: jewelryID}, function(err, jewelRec) {
                        if(err)
                            reject(err)
                        resolve(jewelRec)
                    })
                })

                resolve(jewelry)
            }
            catch(err) {
                reject(err)
            }
        })
    }
    assmrDashBoardChart(params) {
        return new Promise(async (resolve, reject) => {
            try{
                const { email } = params
                const account = await new Promise((resolve, reject) => {
                    this.accountsDS.loadDatabase()
                    this.accountsDS.findOne({email}, {user_id: 1}, function(err, accRec) {
                        if(err)
                            reject(err)
                        resolve(accRec)
                    })
                })
                var your_property_and_some_assumer = []
                // Your property & individuals who assumed it!
                let properties = await new Promise((resolve, reject) => {
                    this.propertiesDS.loadDatabase()
                    this.propertiesDS.find({
                        $where: function(){
                            return this.user_id === account.user_id && this.active == 1
                        }
                    }, function(err, propRec) {
                        if(err)
                            reject(err)
                        resolve(propRec)
                    })
                })

                from(properties)
                    .pipe(
                        groupBy(properties => properties.property_type),
                        mergeMap($group => $group.pipe(
                                reduce((acc, curr) => [...acc, curr], [])
                            )
                        ),
                        map(properties => {
                            const key = properties.slice()[0].property_type
                            const total_prop_posted = properties.length
                            const total_assumption = properties.reduce((acc, curr) => acc+curr.assumption, 0)

                            return {key, total_prop_posted, total_assumption}
                        })
                    )
                    .subscribe(v => your_property_and_some_assumer.push(v))
                // end of Your property & individuals who assumed it!

                //most posted properties CHART-DATA
                properties = await new Promise((resolve, reject) => {
                    this.propertiesDS.loadDatabase()
                    this.propertiesDS.find({
                        $where: function() {
                            return this.active == 1
                        }
                    }, function(err, propRec) {
                        if(err)
                            reject(err)
                        resolve(propRec)
                    })
                })
                var most_posted_properties = []
                var total = 0

                from(properties)
                    .pipe(
                       groupBy(properties => properties.property_type),
                       mergeMap($group => $group.pipe(
                            reduce((acc, curr) => [...acc, curr], [])
                        )
                       ),
                       map(property => [{total: total+property.length, property: property.slice()[0]}])
                    )
                    .subscribe(v => most_posted_properties.push(v[0]))
                //end of most posted properties CHART-DATA

                //most assumed/assumption properties CHART-DATA
                var most_assumed_properties = []
                total = 0
                from(properties)
                    .pipe(
                        groupBy(properties => properties.property_type),
                        mergeMap($group => $group.pipe(
                                reduce((acc, curr) => [...acc, curr], [])
                            )
                        ),
                        map(properties => {
                            total = 0
                            total = properties.reduce((acc, curr) => acc+curr.assumption, 0)

                            return {total, properties}
                        })
                    )
                    .subscribe(v => most_assumed_properties.push(v))
                //end of most assumed/assumption properties CHART-DATA

                resolve({your_property_and_some_assumer, most_posted_properties, most_assumed_properties, has_error: false})
            }
            catch(err) {
                reject(err)
            }
        })
    }
    certainUserInfoUProp(params) {
        return new Promise(async (resolve, reject) => {
            try{
                const { propertyID } = params

                const property_user = await new Promise((resolve, reject) => {
                    this.propertiesDS.loadDatabase()
                    this.propertiesDS.findOne({_id: propertyID}, {user_id: 1}, function(err, propRec) {
                        if(err)
                            reject(err)
                        resolve(propRec)
                    })
                })
                const property_owner = new Promise((resolve, reject) => {
                    this.usersDS.loadDatabase()
                    this.usersDS.findOne({_id: property_user.user_id}, {firstname: 1, middlename: 1, lastname: 1}, function(err, userRec) {
                        if(err)
                            reject(err)
                        resolve(userRec)
                    })
                })
                resolve(property_owner)
            }
            catch(err) {
                reject(err)
            }
        })

    }// get certain user using their property_id, if assumer assume a property and want to send a message to property owner
    activeUserRetrieveMessages(params) {
        return new Promise(async (resolve, reject) => {
            try{
                const { email } = params
                const account = await new Promise((resolve, reject) => {
                    this.accountsDS.loadDatabase()
                    this.accountsDS.findOne({email}, {user_id: 1}, function(err, accRec) {
                        if(err)
                            reject(err)
                        resolve(accRec)
                    })
                })
                const messages = await new Promise((resolve, reject) => {
                    this.messagesDS.loadDatabase()
                    this.messagesDS.find({
                        $where: function() {
                            return this.sender_id === account.user_id || this.receiver_id === account.user_id && this.current == 1
                        }
                    }, function(err, messRec) {
                        if(err)
                            reject(err)
                        resolve(messRec)
                    })
                })

                resolve(messages)
            }
            catch(err){
                reject(err)
            }
        })
    } // for displaying in recyclerview in chatroom_rv.py file
    userOpenChatsWithUser(params) {
        return new Promise(async (resolve, reject) => {
            try{
                const { senderID, receiverID } = params

                const messages = new Promise((resolve, reject) => {
                    this.messagesDS.loadDatabase()
                    this.messagesDS.find({
                        $where: function() {
                            return (this.sender_id === senderID && this.receiver_id === receiverID) || 
                                (this.sender_id === receiverID && this.receiver_id === senderID)
                        }
                    }, function(err, messRec) {
                        if(err)
                            reject(err)
                        resolve(messRec)
                    })
                })
                resolve(messages)
            }
            catch(err) {
                reject(err)
            }
        })
    } // active user send messages to other users
}
module.exports = { MobileUsers, MobileAssumrs }